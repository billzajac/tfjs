/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import {BackendValues, DataType, DataTypeMap, FlatVector, NumericDataType, TensorLike, TypedArray, WebGLData, WebGPUData} from './types';

/**
 * Shuffles the array in-place using Fisher-Yates algorithm.
 *
 * ```js
 * const a = [1, 2, 3, 4, 5];
 * tf.util.shuffle(a);
 * console.log(a);
 * ```
 *
 * @param array The array to shuffle in-place.
 *
 * @doc {heading: 'Util', namespace: 'util'}
 */
// tslint:disable-next-line:no-any
export function shuffle(array: any[]|Uint32Array|Int32Array|
                        Float32Array): void {
  let counter = array.length;
  let index = 0;
  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    index = (Math.random() * counter) | 0;
    // Decrease counter by 1
    counter--;
    // And swap the last element with it
    swap(array, counter, index);
  }
}

/**
 * Shuffles two arrays in-place the same way using Fisher-Yates algorithm.
 *
 * ```js
 * const a = [1,2,3,4,5];
 * const b = [11,22,33,44,55];
 * tf.util.shuffleCombo(a, b);
 * console.log(a, b);
 * ```
 *
 * @param array The first array to shuffle in-place.
 * @param array2 The second array to shuffle in-place with the same permutation
 *     as the first array.
 *
 * @doc {heading: 'Util', namespace: 'util'}
 */
export function shuffleCombo(
    // tslint:disable-next-line:no-any
    array: any[]|Uint32Array|Int32Array|Float32Array,
    // tslint:disable-next-line:no-any
    array2: any[]|Uint32Array|Int32Array|Float32Array): void {
  if (array.length !== array2.length) {
    throw new Error(
        `Array sizes must match to be shuffled together ` +
        `First array length was ${array.length}` +
        `Second array length was ${array2.length}`);
  }
  let counter = array.length;
  let index = 0;
  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    index = (Math.random() * counter) | 0;
    // Decrease counter by 1
    counter--;
    // And swap the last element of each array with it
    swap(array, counter, index);
    swap(array2, counter, index);
  }
}

/** Clamps a value to a specified range. */
export function clamp(min: number, x: number, max: number): number {
  return Math.max(min, Math.min(x, max));
}

export function nearestLargerEven(val: number): number {
  return val % 2 === 0 ? val : val + 1;
}

export function swap<T>(
    object: {[index: number]: T}, left: number, right: number) {
  const temp = object[left];
  object[left] = object[right];
  object[right] = temp;
}

export function sum(arr: number[]): number {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

/**
 * Returns a sample from a uniform [a, b) distribution.
 *
 * @param a The minimum support (inclusive).
 * @param b The maximum support (exclusive).
 * @return A pseudorandom number on the half-open interval [a,b).
 */
export function randUniform(a: number, b: number) {
  const r = Math.random();
  return (b * r) + (1 - r) * a;
}

/** Returns the squared Euclidean distance between two vectors. */
export function distSquared(a: FlatVector, b: FlatVector): number {
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = Number(a[i]) - Number(b[i]);
    result += diff * diff;
  }
  return result;
}

/**
 * Asserts that the expression is true. Otherwise throws an error with the
 * provided message.
 *
 * ```js
 * const x = 2;
 * tf.util.assert(x === 2, () => 'x is not 2');
 * ```
 *
 * @param expr The expression to assert (as a boolean).
 * @param msg A function that returns the message to report when throwing an
 *     error. We use a function for performance reasons.
 *
 * @doc {heading: 'Util', namespace: 'util'}
 */
export function assert(expr: boolean, msg: () => string) {
  if (!expr) {
    throw new Error(typeof msg === 'string' ? msg : msg());
  }
}

export function assertShapesMatch(
    shapeA: number[], shapeB: number[], errorMessagePrefix = ''): void {
  assert(
      arraysEqual(shapeA, shapeB),
      () => errorMessagePrefix + ` Shapes ${shapeA} and ${shapeB} must match`);
}

export function assertNonNull(a: TensorLike): void {
  assert(
      a != null,
      () => `The input to the tensor constructor must be a non-null value.`);
}

/**
 * Returns the size (number of elements) of the tensor given its shape.
 *
 * ```js
 * const shape = [3, 4, 2];
 * const size = tf.util.sizeFromShape(shape);
 * console.log(size);
 * ```
 *
 * @doc {heading: 'Util', namespace: 'util'}
 */
export function sizeFromShape(shape: number[]): number {
  if (shape.length === 0) {
    // Scalar.
    return 1;
  }
  let size = shape[0];
  for (let i = 1; i < shape.length; i++) {
    size *= shape[i];
  }
  return size;
}

export function isScalarShape(shape: number[]): boolean {
  return shape.length === 0;
}

export function arraysEqualWithNull(n1: number[], n2: number[]) {
  if (n1 === n2) {
    return true;
  }

  if (n1 == null || n2 == null) {
    return false;
  }

  if (n1.length !== n2.length) {
    return false;
  }

  for (let i = 0; i < n1.length; i++) {
    if (n1[i] !== null && n2[i] !== null && n1[i] !== n2[i]) {
      return false;
    }
  }
  return true;
}

export function arraysEqual(n1: FlatVector, n2: FlatVector) {
  if (n1 === n2) {
    return true;
  }
  if (n1 == null || n2 == null) {
    return false;
  }

  if (n1.length !== n2.length) {
    return false;
  }
  for (let i = 0; i < n1.length; i++) {
    if (n1[i] !== n2[i]) {
      return false;
    }
  }
  return true;
}

export function isInt(a: number): boolean {
  return a % 1 === 0;
}

export function tanh(x: number): number {
  // tslint:disable-next-line:no-any
  if ((Math as any).tanh != null) {
    // tslint:disable-next-line:no-any
    return (Math as any).tanh(x);
  }
  if (x === Infinity) {
    return 1;
  } else if (x === -Infinity) {
    return -1;
  } else {
    const e2x = Math.exp(2 * x);
    return (e2x - 1) / (e2x + 1);
  }
}

export function sizeToSquarishShape(size: number): [number, number] {
  const width = Math.ceil(Math.sqrt(size));
  return [width, Math.ceil(size / width)];
}

/**
 * Creates a new array with randomized indices to a given quantity.
 *
 * ```js
 * const randomTen = tf.util.createShuffledIndices(10);
 * console.log(randomTen);
 * ```
 *
 * @param number Quantity of how many shuffled indices to create.
 *
 * @doc {heading: 'Util', namespace: 'util'}
 */
export function createShuffledIndices(n: number): Uint32Array {
  const shuffledIndices = new Uint32Array(n);
  for (let i = 0; i < n; ++i) {
    shuffledIndices[i] = i;
  }
  shuffle(shuffledIndices);
  return shuffledIndices;
}

export function rightPad(a: string, size: number): string {
  if (size <= a.length) {
    return a;
  }
  return a + ' '.repeat(size - a.length);
}

export function repeatedTry(
    checkFn: () => boolean, delayFn = (counter: number) => 0,
    maxCounter?: number,
    scheduleFn?: (functionRef: Function, delay: number) =>
        void): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let tryCount = 0;

    const tryFn = () => {
      if (checkFn()) {
        resolve();
        return;
      }

      tryCount++;

      const nextBackoff = delayFn(tryCount);

      if (maxCounter != null && tryCount >= maxCounter) {
        reject();
        return;
      }

      if (scheduleFn != null) {
        scheduleFn(tryFn, nextBackoff);
      } else {
        // google3 does not allow assigning another variable to setTimeout.
        // Don't refactor this so scheduleFn has a default value of setTimeout.
        setTimeout(tryFn, nextBackoff);
      }
    };

    tryFn();
  });
}

/**
 * Given the full size of the array and a shape that may contain -1 as the
 * implicit dimension, returns the inferred shape where -1 is replaced.
 * E.g. For shape=[2, -1, 3] and size=24, it will return [2, 4, 3].
 *
 * @param shape The shape, which may contain -1 in some dimension.
 * @param size The full size (number of elements) of the array.
 * @return The inferred shape where -1 is replaced with the inferred size.
 */
export function inferFromImplicitShape(
    shape: number[], size: number): number[] {
  let shapeProd = 1;
  let implicitIdx = -1;

  for (let i = 0; i < shape.length; ++i) {
    if (shape[i] >= 0) {
      shapeProd *= shape[i];
    } else if (shape[i] === -1) {
      if (implicitIdx !== -1) {
        throw Error(
            `Shapes can only have 1 implicit size. ` +
            `Found -1 at dim ${implicitIdx} and dim ${i}`);
      }
      implicitIdx = i;
    } else if (shape[i] < 0) {
      throw Error(`Shapes can not be < 0. Found ${shape[i]} at dim ${i}`);
    }
  }

  if (implicitIdx === -1) {
    if (size > 0 && size !== shapeProd) {
      throw Error(`Size(${size}) must match the product of shape ${shape}`);
    }
    return shape;
  }

  if (shapeProd === 0) {
    throw Error(
        `Cannot infer the missing size in [${shape}] when ` +
        `there are 0 elements`);
  }
  if (size % shapeProd !== 0) {
    throw Error(
        `The implicit shape can't be a fractional number. ` +
        `Got ${size} / ${shapeProd}`);
  }

  const newShape = shape.slice();
  newShape[implicitIdx] = size / shapeProd;
  return newShape;
}

export function parseAxisParam(
    axis: number|number[], shape: number[]): number[] {
  const rank = shape.length;

  // Normalize input
  axis = axis == null ? shape.map((s, i) => i) : [].concat(axis);

  // Check for valid range
  assert(
      axis.every(ax => ax >= -rank && ax < rank),
      () =>
          `All values in axis param must be in range [-${rank}, ${rank}) but ` +
          `got axis ${axis}`);

  // Check for only integers
  assert(
      axis.every(ax => isInt(ax)),
      () => `All values in axis param must be integers but ` +
          `got axis ${axis}`);

  // Handle negative axis.
  return axis.map(a => a < 0 ? rank + a : a);
}

/** Reduces the shape by removing all dimensions of shape 1. */
export function squeezeShape(shape: number[], axis?: number[]):
    {newShape: number[], keptDims: number[]} {
  const newShape: number[] = [];
  const keptDims: number[] = [];
  const isEmptyArray = axis != null && Array.isArray(axis) && axis.length === 0;
  const axes = (axis == null || isEmptyArray) ?
      null :
      parseAxisParam(axis, shape).sort();
  let j = 0;
  for (let i = 0; i < shape.length; ++i) {
    if (axes != null) {
      if (axes[j] === i && shape[i] !== 1) {
        throw new Error(
            `Can't squeeze axis ${i} since its dim '${shape[i]}' is not 1`);
      }
      if ((axes[j] == null || axes[j] > i) && shape[i] === 1) {
        newShape.push(shape[i]);
        keptDims.push(i);
      }
      if (axes[j] <= i) {
        j++;
      }
    }
    if (shape[i] !== 1) {
      newShape.push(shape[i]);
      keptDims.push(i);
    }
  }
  return {newShape, keptDims};
}

export function getTypedArrayFromDType<D extends NumericDataType>(
    dtype: D, size: number): DataTypeMap[D] {
  return getArrayFromDType<D>(dtype, size);
}

export function getArrayFromDType<D extends DataType>(
    dtype: D, size: number): DataTypeMap[D] {
  let values = null;
  if (dtype == null || dtype === 'float32') {
    values = new Float32Array(size);
  } else if (dtype === 'int32') {
    values = new Int32Array(size);
  } else if (dtype === 'bool') {
    values = new Uint8Array(size);
  } else if (dtype === 'string') {
    values = new Array<string>(size);
  } else {
    throw new Error(`Unknown data type ${dtype}`);
  }
  return values as DataTypeMap[D];
}

export function checkConversionForErrors<D extends DataType>(
    vals: DataTypeMap[D]|number[], dtype: D): void {
  for (let i = 0; i < vals.length; i++) {
    const num = vals[i] as number;
    if (isNaN(num) || !isFinite(num)) {
      throw Error(`A tensor of type ${dtype} being uploaded contains ${num}.`);
    }
  }
}

/** Returns true if the dtype is valid. */
export function isValidDtype(dtype: DataType): boolean {
  return dtype === 'bool' || dtype === 'complex64' || dtype === 'float32' ||
      dtype === 'int32' || dtype === 'string';
}

/**
 * Returns true if the new type can't encode the old type without loss of
 * precision.
 */
export function hasEncodingLoss(oldType: DataType, newType: DataType): boolean {
  if (newType === 'complex64') {
    return false;
  }
  if (newType === 'float32' && oldType !== 'complex64') {
    return false;
  }
  if (newType === 'int32' && oldType !== 'float32' && oldType !== 'complex64') {
    return false;
  }
  if (newType === 'bool' && oldType === 'bool') {
    return false;
  }
  return true;
}

export function bytesPerElement(dtype: DataType): number {
  if (dtype === 'float32' || dtype === 'int32') {
    return 4;
  } else if (dtype === 'complex64') {
    return 8;
  } else if (dtype === 'bool') {
    return 1;
  } else {
    throw new Error(`Unknown dtype ${dtype}`);
  }
}

/**
 * Returns the approximate number of bytes allocated in the string array - 2
 * bytes per character. Computing the exact bytes for a native string in JS
 * is not possible since it depends on the encoding of the html page that
 * serves the website.
 */
export function bytesFromStringArray(arr: Uint8Array[]): number {
  if (arr == null) {
    return 0;
  }
  let bytes = 0;
  arr.forEach(x => bytes += x.length);
  return bytes;
}

/** Returns true if the value is a string. */
export function isString(value: {}): value is string {
  return typeof value === 'string' || value instanceof String;
}

export function isBoolean(value: {}): boolean {
  return typeof value === 'boolean';
}

export function isNumber(value: {}): boolean {
  return typeof value === 'number';
}

export function inferDtype(values: TensorLike|WebGLData|WebGPUData): DataType {
  if (Array.isArray(values)) {
    return inferDtype(values[0]);
  }
  if (values instanceof Float32Array) {
    return 'float32';
  } else if (
      values instanceof Int32Array || values instanceof Uint8Array ||
      values instanceof Uint8ClampedArray) {
    return 'int32';
  } else if (isNumber(values)) {
    return 'float32';
  } else if (isString(values)) {
    return 'string';
  } else if (isBoolean(values)) {
    return 'bool';
  }
  return 'float32';
}

export function isFunction(f: Function) {
  return !!(f && f.constructor && f.call && f.apply);
}

export function nearestDivisor(size: number, start: number): number {
  for (let i = start; i < size; ++i) {
    if (size % i === 0) {
      return i;
    }
  }
  return size;
}

export function computeStrides(shape: number[]): number[] {
  const rank = shape.length;
  if (rank < 2) {
    return [];
  }

  // Last dimension has implicit stride of 1, thus having D-1 (instead of D)
  // strides.
  const strides = new Array(rank - 1);
  strides[rank - 2] = shape[rank - 1];
  for (let i = rank - 3; i >= 0; --i) {
    strides[i] = strides[i + 1] * shape[i + 1];
  }
  return strides;
}

function createNestedArray(
    offset: number, shape: number[], a: TypedArray, isComplex = false) {
  const ret = new Array();
  if (shape.length === 1) {
    const d = shape[0] * (isComplex ? 2 : 1);
    for (let i = 0; i < d; i++) {
      ret[i] = a[offset + i];
    }
  } else {
    const d = shape[0];
    const rest = shape.slice(1);
    const len = rest.reduce((acc, c) => acc * c) * (isComplex ? 2 : 1);
    for (let i = 0; i < d; i++) {
      ret[i] = createNestedArray(offset + i * len, rest, a, isComplex);
    }
  }
  return ret;
}

// Provide a nested array of TypedArray in given shape.
export function toNestedArray(
    shape: number[], a: TypedArray, isComplex = false) {
  if (shape.length === 0) {
    // Scalar type should return a single number.
    return a[0];
  }
  const size = shape.reduce((acc, c) => acc * c) * (isComplex ? 2 : 1);
  if (size === 0) {
    // A tensor with shape zero should be turned into empty list.
    return [];
  }
  if (size !== a.length) {
    throw new Error(`[${shape}] does not match the input size ${a.length}${
        isComplex ? ' for a complex tensor' : ''}.`);
  }

  return createNestedArray(0, shape, a, isComplex);
}

export function convertBackendValuesAndArrayBuffer(
    data: BackendValues|ArrayBuffer, dtype: DataType) {
  // If is type Uint8Array[], return it directly.
  if (Array.isArray(data)) {
    return data;
  }
  if (dtype === 'float32') {
    return data instanceof Float32Array ? data : new Float32Array(data);
  } else if (dtype === 'int32') {
    return data instanceof Int32Array ? data : new Int32Array(data);
  } else if (dtype === 'bool' || dtype === 'string') {
    return Uint8Array.from(new Int32Array(data));
  } else {
    throw new Error(`Unknown dtype ${dtype}`);
  }
}

export function makeOnesTypedArray<D extends DataType>(
    size: number, dtype: D): DataTypeMap[D] {
  const array = makeZerosTypedArray(size, dtype);
  for (let i = 0; i < array.length; i++) {
    array[i] = 1;
  }
  return array;
}

export function makeZerosTypedArray<D extends DataType>(
    size: number, dtype: D): DataTypeMap[D] {
  if (dtype == null || dtype === 'float32' || dtype === 'complex64') {
    return new Float32Array(size) as DataTypeMap[D];
  } else if (dtype === 'int32') {
    return new Int32Array(size) as DataTypeMap[D];
  } else if (dtype === 'bool') {
    return new Uint8Array(size) as DataTypeMap[D];
  } else {
    throw new Error(`Unknown data type ${dtype}`);
  }
}

/**
 * Make nested `TypedArray` filled with zeros.
 * @param shape The shape information for the nested array.
 * @param dtype dtype of the array element.
 */
export function makeZerosNestedTypedArray<D extends DataType>(
    shape: number[], dtype: D) {
  const size = shape.reduce((prev, curr) => prev * curr, 1);
  if (dtype == null || dtype === 'float32') {
    return toNestedArray(shape, new Float32Array(size));
  } else if (dtype === 'int32') {
    return toNestedArray(shape, new Int32Array(size));
  } else if (dtype === 'bool') {
    return toNestedArray(shape, new Uint8Array(size));
  } else {
    throw new Error(`Unknown data type ${dtype}`);
  }
}

export function assertNonNegativeIntegerDimensions(shape: number[]) {
  shape.forEach(dimSize => {
    assert(
        Number.isInteger(dimSize) && dimSize >= 0,
        () =>
            `Tensor must have a shape comprised of positive integers but got ` +
            `shape [${shape}].`);
  });
}

/**
 * Computes flat index for a given location (multidimentionsal index) in a
 * Tensor/multidimensional array.
 *
 * @param locs Location in the tensor.
 * @param rank Rank of the tensor.
 * @param strides Tensor strides.
 */
export function locToIndex(
    locs: number[], rank: number, strides: number[]): number {
  if (rank === 0) {
    return 0;
  } else if (rank === 1) {
    return locs[0];
  }
  let index = locs[locs.length - 1];
  for (let i = 0; i < locs.length - 1; ++i) {
    index += strides[i] * locs[i];
  }
  return index;
}

/**
 * Computes the location (multidimensional index) in a
 * tensor/multidimentional array for a given flat index.
 *
 * @param index Index in flat array.
 * @param rank Rank of tensor.
 * @param strides Strides of tensor.
 */
export function indexToLoc(
    index: number, rank: number, strides: number[]): number[] {
  if (rank === 0) {
    return [];
  } else if (rank === 1) {
    return [index];
  }
  const locs: number[] = new Array(rank);
  for (let i = 0; i < locs.length - 1; ++i) {
    locs[i] = Math.floor(index / strides[i]);
    index -= locs[i] * strides[i];
  }
  locs[locs.length - 1] = index;
  return locs;
}

/**
 * This method asserts whether an object is a Promise instance.
 * @param object
 */
// tslint:disable-next-line: no-any
export function isPromise(object: any): object is Promise<unknown> {
  //  We chose to not use 'obj instanceOf Promise' for two reasons:
  //  1. It only reliably works for es6 Promise, not other Promise
  //  implementations.
  //  2. It doesn't work with framework that uses zone.js. zone.js monkey
  //  patch the async calls, so it is possible the obj (patched) is
  //  comparing to a pre-patched Promise.
  return object && object.then && typeof object.then === 'function';
}
