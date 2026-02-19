/*
 * Copyright 2025 - 2026 Zigflow authors <https://github.com/mrsimonemms/zigflow/graphs/contributors>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package cmd

import (
	"fmt"
	"os"

	gh "github.com/mrsimonemms/golang-helpers"
	"github.com/mrsimonemms/golang-helpers/temporal"
	"github.com/mrsimonemms/temporal-codec-server/packages/golang/algorithms/aes"
	"github.com/mrsimonemms/zigflow/pkg/cloudevents"
	"github.com/mrsimonemms/zigflow/pkg/telemetry"
	"github.com/mrsimonemms/zigflow/pkg/utils"
	"github.com/mrsimonemms/zigflow/pkg/zigflow"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/serverlessworkflow/sdk-go/v3/model"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/converter"
	"go.temporal.io/sdk/worker"
)

type rootOptions struct {
	CloudEventsConfig    string
	ConvertData          bool
	ConvertKeyPath       string
	DisableTelemetry     bool
	EnvPrefix            string
	FilePath             string
	HealthListenAddress  string
	LogLevel             string
	MetricsListenAddress string
	MetricsPrefix        string
	TemporalAddress      string
	TemporalAPIKey       string
	TemporalMTLSCertPath string
	TemporalMTLSKeyPath  string
	TemporalTLSEnabled   bool
	TemporalNamespace    string
	Validate             bool
}

func panicMessage(r any) string {
	switch v := r.(type) {
	case error:
		return v.Error()
	case string:
		return v
	default:
		return fmt.Sprintf("%+v", v)
	}
}

func buildDataConverter(convertData bool, keyPath string) (converter.DataConverter, error) {
	if !convertData {
		return nil, nil
	}
	keys, err := aes.ReadKeyFile(keyPath)
	if err != nil {
		return nil, gh.FatalError{
			Cause: err,
			Msg:   "Unable to get keys from file",
			WithParams: func(l *zerolog.Event) *zerolog.Event {
				return l.Str("keypath", keyPath)
			},
		}
	}
	return aes.DataConverter(keys), nil
}

func runValidation(validator *utils.Validator, workflowDefinition any) error {
	log.Debug().Msg("Running validation")
	res, err := validator.ValidateStruct(workflowDefinition)
	if err != nil {
		return gh.FatalError{
			Cause: err,
			Msg:   "Error creating validation stack",
		}
	}
	if res != nil {
		return gh.FatalError{
			Msg: "Validation failed",
			WithParams: func(l *zerolog.Event) *zerolog.Event {
				f := []struct {
					Key     string
					Message string
				}{}
				for _, r := range res {
					f = append(f, struct {
						Key     string
						Message string
					}{
						Key:     r.Key,
						Message: r.Message,
					})
				}
				return l.Interface("validationErrors", f)
			},
		}
	}
	log.Debug().Msg("Validation passed")
	return nil
}

func startWorker(
	temporalClient client.Client,
	taskQueue string,
	workflowDefinition *model.Workflow,
	envvars map[string]any,
	events *cloudevents.Events,
) error {
	pollerAutoscaler := worker.NewPollerBehaviorAutoscaling(worker.PollerBehaviorAutoscalingOptions{})
	temporalWorker := worker.New(temporalClient, taskQueue, worker.Options{
		WorkflowTaskPollerBehavior: pollerAutoscaler,
		ActivityTaskPollerBehavior: pollerAutoscaler,
		NexusTaskPollerBehavior:    pollerAutoscaler,
	})

	if err := zigflow.NewWorkflow(temporalWorker, workflowDefinition, envvars, events); err != nil {
		return gh.FatalError{
			Cause: err,
			Msg:   "Unable to build workflow from DSL",
		}
	}

	if err := temporalWorker.Run(worker.InterruptCh()); err != nil {
		return gh.FatalError{
			Cause: err,
			Msg:   "Unable to start worker",
		}
	}

	return nil
}

func runRootCmd(cmd *cobra.Command, opts *rootOptions) error {
	defer func() {
		if r := recover(); r != nil {
			log.Fatal().
				Str("type", fmt.Sprintf("%T", r)).
				Str("panicMsg", panicMessage(r)).
				Msg("Recovered from panic")
		}
	}()

	workflowDefinition, err := zigflow.LoadFromFile(opts.FilePath)
	if err != nil {
		return gh.FatalError{Cause: err, Msg: "Unable to load workflow file"}
	}

	validator, err := utils.NewValidator()
	if err != nil {
		return gh.FatalError{Cause: err, Msg: "Error creating validator"}
	}

	if opts.Validate {
		if err := runValidation(validator, workflowDefinition); err != nil {
			return err
		}
	}

	log.Debug().Str("cloudEventsConfig", opts.CloudEventsConfig).Msg("Registering CloudEvents handler")
	events, err := cloudevents.Load(opts.CloudEventsConfig, validator, workflowDefinition)
	if err != nil {
		return gh.FatalError{
			Cause: err,
			Msg:   "Error creating CloudEvents handler",
		}
	}

	dataConverter, err := buildDataConverter(opts.ConvertData, opts.ConvertKeyPath)
	if err != nil {
		return err
	}

	// The client and worker are heavyweight objects that should be created once per process.
	log.Trace().Msg("Connecting to Temporal")
	temporalClient, err := temporal.NewConnection(
		temporal.WithHostPort(opts.TemporalAddress),
		temporal.WithNamespace(opts.TemporalNamespace),
		temporal.WithTLS(opts.TemporalTLSEnabled),
		temporal.WithAuthDetection(
			opts.TemporalAPIKey,
			opts.TemporalMTLSCertPath,
			opts.TemporalMTLSKeyPath,
		),
		temporal.WithDataConverter(dataConverter),
		temporal.WithZerolog(&log.Logger),
		temporal.WithPrometheusMetrics(opts.MetricsListenAddress, opts.MetricsPrefix, nil),
	)
	if err != nil {
		return gh.FatalError{
			Cause: err,
			Msg:   "Unable to create client",
		}
	}
	defer func() {
		log.Trace().Msg("Closing Temporal connection")
		temporalClient.Close()
		log.Trace().Msg("Temporal connection closed")
	}()

	taskQueue := workflowDefinition.Document.Namespace
	prefix := opts.EnvPrefix + "_"

	log.Debug().Str("prefix", prefix).Msg("Loading envvars to state")
	envvars := utils.LoadEnvvars(prefix)

	log.Debug().Msg("Starting health check service")
	temporal.NewHealthCheck(cmd.Context(), taskQueue, opts.HealthListenAddress, temporalClient)

	log.Info().Msg("Updating schedules")
	if err := zigflow.UpdateSchedules(cmd.Context(), temporalClient, workflowDefinition, envvars); err != nil {
		return gh.FatalError{
			Cause: err,
			Msg:   "Error updating Temporal schedules",
		}
	}

	log.Info().Str("task-queue", taskQueue).Msg("Starting workflow")

	return startWorker(temporalClient, taskQueue, workflowDefinition, envvars, events)
}

func registerRootFlags(rootCmd *cobra.Command, opts *rootOptions) {
	rootCmd.Flags().StringVar(
		&opts.CloudEventsConfig, "cloudevents-config",
		viper.GetString("cloudevents_config"), "Path to CloudEvents config file",
	)

	rootCmd.Flags().BoolVar(
		&opts.ConvertData, "convert-data",
		viper.GetBool("convert_data"), "Enable AES data conversion",
	)

	viper.SetDefault("converter_key_path", "keys.yaml")
	rootCmd.Flags().StringVar(
		&opts.ConvertKeyPath, "converter-key-path",
		viper.GetString("converter_key_path"), "Path to AES conversion keys",
	)

	viper.SetDefault("disable_telemetry", false)
	rootCmd.Flags().BoolVar(
		&opts.DisableTelemetry, "disable-telemetry", viper.GetBool("disable_telemetry"),
		"Disables all anonymous usage reporting. No telemetry data will be sent.",
	)

	rootCmd.Flags().StringVarP(
		&opts.FilePath, "file", "f",
		viper.GetString("workflow_file"), "Path to workflow file",
	)

	viper.SetDefault("env_prefix", "ZIGGY")
	rootCmd.Flags().StringVar(
		&opts.EnvPrefix, "env-prefix",
		viper.GetString("env_prefix"), "Load envvars with this prefix to the workflow",
	)

	viper.SetDefault("health_listen_address", "0.0.0.0:3000")
	rootCmd.Flags().StringVar(
		&opts.HealthListenAddress, "health-listen-address",
		viper.GetString("health_listen_address"), "Address of health server",
	)

	viper.SetDefault("log_level", zerolog.InfoLevel.String())
	rootCmd.PersistentFlags().StringVarP(
		&opts.LogLevel, "log-level", "l",
		viper.GetString("log_level"), "Set log level",
	)

	viper.SetDefault("metrics_listen_address", "0.0.0.0:9090")
	rootCmd.Flags().StringVar(
		&opts.MetricsListenAddress, "metrics-listen-address",
		viper.GetString("metrics_listen_address"), "Address of Prometheus metrics server",
	)

	rootCmd.Flags().StringVar(
		&opts.MetricsPrefix, "metrics-prefix",
		viper.GetString("metrics_prefix"), "Prefix for metrics",
	)

	viper.SetDefault("temporal_address", client.DefaultHostPort)
	rootCmd.Flags().StringVarP(
		&opts.TemporalAddress, "temporal-address", "H",
		viper.GetString("temporal_address"), "Address of the Temporal server",
	)

	rootCmd.Flags().StringVar(
		&opts.TemporalAPIKey, "temporal-api-key",
		viper.GetString("temporal_api_key"), "API key for Temporal authentication",
	)
	// Hide the default value to avoid spaffing the API to command line
	gh.HideCommandOutput(rootCmd, "temporal-api-key")

	rootCmd.Flags().StringVar(
		&opts.TemporalMTLSCertPath, "tls-client-cert-path",
		viper.GetString("temporal_tls_client_cert_path"), "Path to mTLS client cert, usually ending in .pem",
	)

	rootCmd.Flags().StringVar(
		&opts.TemporalMTLSKeyPath, "tls-client-key-path",
		viper.GetString("temporal_tls_client_key_path"), "Path to mTLS client key, usually ending in .key",
	)

	viper.SetDefault("temporal_namespace", client.DefaultNamespace)
	rootCmd.Flags().StringVarP(
		&opts.TemporalNamespace, "temporal-namespace", "n",
		viper.GetString("temporal_namespace"), "Temporal namespace to use",
	)

	rootCmd.Flags().BoolVar(
		&opts.TemporalTLSEnabled, "temporal-tls",
		viper.GetBool("temporal_tls"), "Enable TLS Temporal connection",
	)

	viper.SetDefault("validate", true)
	rootCmd.Flags().BoolVar(
		&opts.Validate, "validate",
		viper.GetBool("validate"), "Run workflow validation",
	)
}

func newRootCmd() *cobra.Command {
	viper.AutomaticEnv()

	var opts rootOptions

	rootCmd := &cobra.Command{
		Use:     "zigflow",
		Version: Version,
		Short:   "A Temporal DSL for turning declarative YAML into production-ready workflows",
		Long: `Zigflow is a command-line tool for building and running Temporal workflows
defined in declarative YAML. It uses the CNCF Serverless Workflow specification
to let you describe durable business processes in a structured, human-readable
format, giving you the reliability and fault tolerance of Temporal without
writing boilerplate worker code.

With Zigflow, you can:
- Define workflow logic using simple YAML DSL that maps directly to Temporal
  concepts like activities, signals, queries and retries.

- Run workflows locally or in production, with workers and task queues
  automatically defined from your workflow files.

- Reuse workflow components and enforce consistent patterns across your Temporal
  estate, making it easier to share and maintain workflow logic across teams and
  projects.

The CLI includes commands for validating, executing, and generating helpers
for your workflows, making it an intuitive interface for both developers and
operators. Zigflow aims to reduce the cognitive load of writing boilerplate
Temporal code while preserving the full power and extensibility of the Temporal
platform.`,
		SilenceUsage:  true,
		SilenceErrors: true,
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			level, err := zerolog.ParseLevel(opts.LogLevel)
			if err != nil {
				return err
			}
			zerolog.SetGlobalLevel(level)

			return nil
		},
		PreRun: func(cmd *cobra.Command, args []string) {
			if !opts.DisableTelemetry {
				// Thank you - it helps us to see usage
				if err := telemetry.Notify(Version); err != nil {
					// Log the error, but that's all
					log.Trace().Err(err).Msg("Failed to send anonymous telemetry - oh well")
				}
			}
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			return runRootCmd(cmd, &opts)
		},
	}

	registerRootFlags(rootCmd, &opts)

	rootCmd.AddCommand(
		newVersionCmd(),
		newValidateCmd(),
		newSchemaCmd(),
		newGenerateDocsCmd(rootCmd),
	)

	return rootCmd
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := newRootCmd().Execute(); err != nil {
		os.Exit(gh.HandleFatalError(err))
	}
}
