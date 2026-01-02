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

package utils

import (
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/itchyny/gojq"
	"github.com/serverlessworkflow/sdk-go/v3/model"
	"go.temporal.io/sdk/temporal"
)

type ExpressionWrapperFunc func(func() (any, error)) (any, error)

type jqFunc struct {
	Name    string                         // Becomes the name of the function to use (eg, ${ uuid })
	MinArgs int                            // Minimum number of args
	MaxArgs int                            // Maximum number of args
	Func    func(vars any, args []any) any // The function - receives the variables and arguments
}

// List of functions that are available as a function
var jqFuncs []jqFunc = []jqFunc{
	{
		Name: "uuid",
		Func: func(_ any, _ []any) any {
			return uuid.New().String()
		},
	},
}

// The return value could be any value depending upon how it's parsed
func EvaluateString(str string, ctx any, state *State, evaluationWrapper ...ExpressionWrapperFunc) (any, error) {
	// Check if the string is a runtime expression (e.g., ${ .some.path })
	if model.IsStrictExpr(str) {
		// Wrapper exists to allow JQ evaluation to be put inside a workflow to make deterministic
		fn := buildEvaluationWrapperFn(evaluationWrapper...)

		return fn(func() (any, error) {
			return evaluateJQExpression(model.SanitizeExpr(str), ctx, state)
		})
	}
	return str, nil
}

func buildEvaluationWrapperFn(evaluationWrapper ...ExpressionWrapperFunc) ExpressionWrapperFunc {
	var wrapperFn ExpressionWrapperFunc = func(f func() (any, error)) (any, error) {
		return f()
	}
	if len(evaluationWrapper) > 0 {
		// If a function is passed in, use that instead
		wrapperFn = evaluationWrapper[0]
	}

	return wrapperFn
}

func TraverseAndEvaluateObj(
	runtimeExpr *model.ObjectOrRuntimeExpr,
	ctx any,
	state *State,
	evaluationWrapper ...ExpressionWrapperFunc,
) (any, error) {
	if runtimeExpr == nil {
		return nil, nil
	}

	// Default to a simple pass-thru function
	wrapperFn := buildEvaluationWrapperFn(evaluationWrapper...)

	return traverseAndEvaluate(runtimeExpr.AsStringOrMap(), ctx, state, wrapperFn)
}

func traverseAndEvaluate(node, ctx any, state *State, evaluationWrapper ExpressionWrapperFunc) (any, error) {
	switch v := node.(type) {
	case map[string]any:
		// Traverse a object
		for key, value := range v {
			evaluatedValue, err := traverseAndEvaluate(value, ctx, state, evaluationWrapper)
			if err != nil {
				return nil, err
			}
			v[key] = evaluatedValue
		}
		return v, nil
	case []any:
		// Traverse an array
		return traverseSlice(v, ctx, state, evaluationWrapper)
	case []string:
		// Traverse an array
		return traverseSlice(toAnySlice(v), ctx, state, evaluationWrapper)
	case string:
		return EvaluateString(v, ctx, state, evaluationWrapper)
	default:
		// Return as-is
		return v, nil
	}
}

func traverseSlice(v []any, ctx any, state *State, evaluationWrapper ExpressionWrapperFunc) ([]any, error) {
	for i, value := range v {
		evaluatedValue, err := traverseAndEvaluate(value, ctx, state, evaluationWrapper)
		if err != nil {
			return nil, err
		}
		v[i] = evaluatedValue
	}
	return v, nil
}

func toAnySlice[T any](in []T) []any {
	out := make([]any, len(in))
	for i, v := range in {
		out[i] = v
	}
	return out
}

func evaluateJQExpression(expression string, ctx any, state *State) (any, error) {
	query, err := gojq.Parse(expression)
	if err != nil {
		return nil, fmt.Errorf("failed to parse jq expression: %s, error: %w", expression, err)
	}

	// Get the variable names & values in a single pass:
	names, values := getVariableNamesAndValues(state.GetAsMap())

	fns := []gojq.CompilerOption{
		gojq.WithVariables(names),
	}

	for _, j := range jqFuncs {
		fns = append(fns, gojq.WithFunction(j.Name, j.MinArgs, j.MaxArgs, j.Func))
	}

	code, err := gojq.Compile(query, fns...)
	if err != nil {
		return nil, fmt.Errorf("failed to compile jq expression: %s, error: %w", expression, err)
	}

	iter := code.Run(ctx, values...)
	v, ok := iter.Next()
	if !ok {
		return nil, fmt.Errorf("no result from jq evaluation")
	}
	// If there's an error from the jq engine, report it
	if errVal, isErr := v.(error); isErr {
		return nil, fmt.Errorf("jq evaluation error: %w", errVal)
	}

	return v, nil
}

func CheckIfStatement(ifStatement *model.RuntimeExpression, state *State) (bool, error) {
	if ifStatement == nil {
		return true, nil
	}

	res, err := EvaluateString(ifStatement.String(), nil, state)
	if err != nil {
		// Treat a parsing error as non-retryable
		return false, temporal.NewNonRetryableApplicationError("Error parsing if statement", "If statement error", err)
	}

	// Response can be a boolean, "TRUE" (case-insensitive) or "1"
	switch r := res.(type) {
	case bool:
		return r, nil
	case string:
		return strings.EqualFold(r, "TRUE") || r == "1", nil
	default:
		return false, temporal.NewNonRetryableApplicationError(
			"If statement response type unknown",
			"If statement error",
			fmt.Errorf("response not string or bool"),
		)
	}
}

func getVariableNamesAndValues(vars map[string]any) (names []string, values []any) {
	names = make([]string, 0, len(vars))
	values = make([]any, 0, len(vars))

	for k, v := range vars {
		names = append(names, k)
		values = append(values, v)
	}
	return names, values
}
