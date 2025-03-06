"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullTerminatedString = exports.RawString = exports.Pointer64 = exports.Pointer32 = exports.Pointer16 = exports.Pointer8 = exports.SizeOf64 = exports.SizeOf32 = exports.SizeOf16 = exports.SizeOf8 = exports.I64s = exports.I32s = exports.I16s = exports.I8s = exports.U64s = exports.U32s = exports.U16s = exports.U8s = exports.I64 = exports.I32 = exports.I16 = exports.I8 = exports.U64 = exports.U32 = exports.U16 = exports.U8 = exports.Struct = exports.NullTerminatedStringType = exports.RawStringType = exports.Pointer64Type = exports.SizeOf64Type = exports.I64sType = exports.U64sType = exports.I64Type = exports.U64Type = exports.StructType = exports.AlignmentPadding = exports.StructAlignment = exports.Endian = void 0;
const assert = (condition, message) => {
    if (!condition) {
        throw new Error(message);
    }
};
const validName = '[a-zA-Z0-9_\\-]+';
const validNameRegex = new RegExp(`^${validName}$`);
const pathRegex = new RegExp(`^(${validName}\.)*${validName}$`);
var Endian;
(function (Endian) {
    Endian["Little"] = "Little";
    Endian["Big"] = "Big";
})(Endian = exports.Endian || (exports.Endian = {}));
var StructAlignment;
(function (StructAlignment) {
    StructAlignment["Packed"] = "Packed";
    StructAlignment["Align2Byte"] = "Align2Byte";
    StructAlignment["Align4Byte"] = "Align4Byte";
    StructAlignment["Align8Byte"] = "Align8Byte";
})(StructAlignment = exports.StructAlignment || (exports.StructAlignment = {}));
const AlignmentBoundaries = {
    [StructAlignment.Packed]: 0,
    [StructAlignment.Align2Byte]: 2,
    [StructAlignment.Align4Byte]: 4,
    [StructAlignment.Align8Byte]: 8,
};
// https://github.com/AsahiLinux/dcp-parser/blob/363f10217e9fcd30e2e69080e33abe66437175e0/parser.c#L10
const alignTo = (value, boundary) => ((value + (boundary - 1)) & ~(boundary - 1));
var AlignmentPadding;
(function (AlignmentPadding) {
    AlignmentPadding["BeforeData"] = "BeforeData";
    AlignmentPadding["AfterData"] = "AfterData";
})(AlignmentPadding = exports.AlignmentPadding || (exports.AlignmentPadding = {}));
class StructType {
    constructor(name, alignment = StructAlignment.Packed, paddingDirection = AlignmentPadding.AfterData) {
        this.fields = [];
        this.fieldMap = {};
        this.name = name;
        this.alignment = alignment;
        this.paddingDirection = paddingDirection;
    }
    get(name) {
        assert((name in this.fieldMap), `No field with name ${name} exists on Struct ${this.name}`);
        return this.fieldMap[name].field;
    }
    getDeep(path) {
        assert(pathRegex.test(path), `Path "${path}" is not valid`);
        const [head, ...tail] = path.split('.');
        const nextPart = this.get(head);
        if (tail.length === 0) {
            return nextPart;
        }
        assert(nextPart instanceof StructType, `Item in path "${head}" is not a Struct`);
        return nextPart.getDeep(tail.join('.'));
    }
    getDeepOffset(path, startOffset = 0) {
        assert(pathRegex.test(path), `Path "${path}" is not valid`);
        const [head, ...tail] = path.split('.');
        const nextPart = this.get(head);
        const nextOffset = startOffset + this.getOffset(head);
        if (tail.length === 0) {
            return nextOffset;
        }
        assert(nextPart instanceof StructType, `Item in path "${head}" is not a Struct`);
        return nextPart.getDeepOffset(tail.join('.'), nextOffset);
    }
    getOffset(name) {
        assert((name in this.fieldMap), `No field with name ${name} exists on Struct ${this.name}`);
        let total = 0;
        for (let { name: fName, field } of this.fields) {
            if (name === fName)
                break;
            let bufSize = field.computeBufferSize();
            if (this.alignment !== StructAlignment.Packed) {
                bufSize = alignTo(bufSize, AlignmentBoundaries[this.alignment]);
            }
            total += bufSize;
        }
        return total;
    }
    field(name, item) {
        assert(!(name in this.fieldMap), `A field already exists on Struct ${this.name} with name ${name}`);
        assert(validNameRegex.test(name), `Name "${name}" is not valid. Names can be made of letters, numbers, underscores, and dashes`);
        const field = { name, field: item };
        this.fields.push(field);
        this.fieldMap[name] = field;
        return this;
    }
    computeBufferSize() {
        return this.fields.reduce((acc, { field }) => {
            let bufSize = field.computeBufferSize();
            if (this.alignment !== StructAlignment.Packed) {
                bufSize = alignTo(bufSize, AlignmentBoundaries[this.alignment]);
            }
            return acc + bufSize;
        }, 0);
    }
    toUint8Array() {
        const buffers = this.fields.map(({ field }) => {
            const buffer = field.toUint8Array();
            if (this.alignment === StructAlignment.Packed) {
                return buffer;
            }
            const size = alignTo(buffer.length, AlignmentBoundaries[this.alignment]);
            const resizedBuffer = new Uint8Array(size);
            if (this.paddingDirection === AlignmentPadding.AfterData) {
                resizedBuffer.set(buffer);
            }
            else {
                resizedBuffer.set(buffer, size - buffer.length);
            }
            return resizedBuffer;
        });
        const totalSize = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
        const buffer = new Uint8Array(totalSize);
        let offset = 0;
        for (let fieldBuffer of buffers) {
            buffer.set(fieldBuffer, offset);
            offset += fieldBuffer.length;
        }
        return buffer;
    }
}
exports.StructType = StructType;
const u8sTou8s = (ns) => {
    return new Uint8Array(ns);
};
const u16sTou8s = (ns, isLittleEndian) => {
    const stride = 2;
    const buffer = new Uint8Array(ns.length * stride);
    let i = 0;
    for (let n of ns) {
        if (isLittleEndian) {
            buffer[i + 0] = n & 0xff;
            buffer[i + 1] = (n >> 8) & 0xff;
        }
        else {
            buffer[i + 1] = n & 0xff;
            buffer[i + 0] = (n >> 8) & 0xff;
        }
        i += stride;
    }
    return buffer;
};
const u32sTou8s = (ns, isLittleEndian) => {
    const stride = 4;
    const buffer = new Uint8Array(ns.length * stride);
    let i = 0;
    for (let n of ns) {
        if (isLittleEndian) {
            buffer[i + 0] = n & 0xff;
            buffer[i + 1] = (n >> 8) & 0xff;
            buffer[i + 2] = (n >> 16) & 0xff;
            buffer[i + 3] = (n >> 24) & 0xff;
        }
        else {
            buffer[i + 3] = n & 0xff;
            buffer[i + 2] = (n >> 8) & 0xff;
            buffer[i + 1] = (n >> 16) & 0xff;
            buffer[i + 0] = (n >> 24) & 0xff;
        }
        i += stride;
    }
    return buffer;
};
const u64sTou8s = (ns, isLittleEndian) => {
    const stride = 8;
    const buffer = new Uint8Array(ns.length * stride);
    let i = 0;
    for (let n of ns) {
        if (isLittleEndian) {
            buffer[i + 0] = Number(n & 0xffn);
            buffer[i + 1] = Number((n >> 8n) & 0xffn);
            buffer[i + 2] = Number((n >> 16n) & 0xffn);
            buffer[i + 3] = Number((n >> 24n) & 0xffn);
            buffer[i + 4] = Number((n >> 32n) & 0xffn);
            buffer[i + 5] = Number((n >> 40n) & 0xffn);
            buffer[i + 6] = Number((n >> 48n) & 0xffn);
            buffer[i + 7] = Number((n >> 56n) & 0xffn);
        }
        else {
            buffer[i + 7] = Number(n & 0xffn);
            buffer[i + 6] = Number((n >> 8n) & 0xffn);
            buffer[i + 5] = Number((n >> 16n) & 0xffn);
            buffer[i + 4] = Number((n >> 24n) & 0xffn);
            buffer[i + 3] = Number((n >> 32n) & 0xffn);
            buffer[i + 2] = Number((n >> 40n) & 0xffn);
            buffer[i + 1] = Number((n >> 48n) & 0xffn);
            buffer[i + 0] = Number((n >> 56n) & 0xffn);
        }
        i += stride;
    }
    return buffer;
};
const normalise64 = (n) => {
    return n < 0n
        ? 0xffffffffffffffffn + n + 1n
        : n;
};
class BaseField {
    constructor(width, min, max, toBytesFn, value, endian) {
        this.width = width;
        this.min = min;
        this.max = max;
        this.toBytesFn = toBytesFn;
        this.assertInvariants(value);
        this.value = value;
        this.endian = endian;
    }
    assertInvariants(value) {
        assert(value >= this.min && value <= this.max, `value must be an integer between ${this.min} and ${this.max}`);
        assert(Number.isInteger(value), `value must be an integer between ${this.min} and ${this.max}`);
    }
    computeBufferSize() { return this.width; }
    toUint8Array() {
        return this.toBytesFn([this.value], this.endian === Endian.Little);
    }
    set(value) {
        this.assertInvariants(value);
        this.value = value;
    }
    get() { return this.value; }
}
class U8Type extends BaseField {
    constructor(value, endian = Endian.Little) {
        super(1, 0, 0xff, u8sTou8s, value, endian);
    }
}
class U16Type extends BaseField {
    constructor(value, endian = Endian.Little) {
        super(2, 0, 0xffff, u16sTou8s, value, endian);
    }
}
class U32Type extends BaseField {
    constructor(value, endian = Endian.Little) {
        super(4, 0, 0xffffffff, u32sTou8s, value, endian);
    }
}
class I8Type extends BaseField {
    constructor(value, endian = Endian.Little) {
        super(1, -0x80, 0x7f, u8sTou8s, value, endian);
    }
}
class I16Type extends BaseField {
    constructor(value, endian = Endian.Little) {
        super(2, -0x8000, 0x7fff, u16sTou8s, value, endian);
    }
}
class I32Type extends BaseField {
    constructor(value, endian = Endian.Little) {
        super(4, -0x80000000, 0x7fffffff, u32sTou8s, value, endian);
    }
}
class BaseArrayField {
    constructor(width, min, max, toBytesFn, values, endian = Endian.Little) {
        this.width = width;
        this.min = min;
        this.max = max;
        this.toBytesFn = toBytesFn;
        this.assertInvariants(values);
        this.values = Object.freeze([...values]);
        this.endian = endian;
    }
    assertInvariants(values) {
        values.forEach(value => {
            assert(value >= this.min && value <= this.max, `value must be an integer between ${this.min} and ${this.max}`);
            assert(Number.isInteger(value), `value must be an integer between ${this.min} and ${this.max}`);
        });
    }
    computeBufferSize() {
        return this.values.length * this.width;
    }
    get() { return [...this.values]; }
    set(values) {
        this.assertInvariants(values);
        this.values = Object.freeze([...values]);
    }
    toUint8Array() {
        return this.toBytesFn(this.values, this.endian === Endian.Little);
    }
}
class U8sType extends BaseArrayField {
    constructor(values, endian = Endian.Little) {
        super(1, 0, 0xff, u8sTou8s, values, endian);
    }
}
class U16sType extends BaseArrayField {
    constructor(values, endian = Endian.Little) {
        super(2, 0, 0xffff, u16sTou8s, values, endian);
    }
}
class U32sType extends BaseArrayField {
    constructor(values, endian = Endian.Little) {
        super(4, 0, 0xffffffff, u32sTou8s, values, endian);
    }
}
class I8sType extends BaseArrayField {
    constructor(values, endian = Endian.Little) {
        super(1, -0x80, 0x7f, u8sTou8s, values, endian);
    }
}
class I16sType extends BaseArrayField {
    constructor(values, endian = Endian.Little) {
        super(2, -0x8000, 0x7fff, u16sTou8s, values, endian);
    }
}
class I32sType extends BaseArrayField {
    constructor(values, endian = Endian.Little) {
        super(4, -0x80000000, 0x7fffffff, u32sTou8s, values, endian);
    }
}
class U64Type {
    constructor(value, endian = Endian.Little) {
        this.assertInvariants(value);
        this.value = value;
        this.endian = endian;
    }
    assertInvariants(value) {
        const max = 0xffffffffffffffffn;
        assert(value >= 0n && value <= max, `value must be a positive integer between 0 and ${max.toString()}`);
    }
    computeBufferSize() { return 8; }
    toUint8Array() {
        return u64sTou8s([this.value], this.endian === Endian.Little);
    }
    set(value) {
        this.assertInvariants(value);
        this.value = value;
    }
    get() { return this.value; }
}
exports.U64Type = U64Type;
class I64Type {
    constructor(value, endian = Endian.Little) {
        this.assertInvariants(value);
        this.value = value;
        this.endian = endian;
    }
    assertInvariants(value) {
        const min = -0x8000000000000000n;
        const max = 0x7fffffffffffffffn;
        assert(value >= min && value <= max, `value must be an integer between ${min.toString()} and ${max.toString()}`);
    }
    computeBufferSize() { return 8; }
    toUint8Array() {
        return u64sTou8s([normalise64(this.value)], this.endian === Endian.Little);
    }
    set(value) {
        this.assertInvariants(value);
        this.value = value;
    }
    get() { return this.value; }
}
exports.I64Type = I64Type;
class U64sType {
    constructor(values, endian = Endian.Little) {
        this.assertInvariants(values);
        this.values = Object.freeze([...values]);
        this.endian = endian;
    }
    assertInvariants(values) {
        const max = 2n ** 64n - 1n;
        values.forEach(value => {
            assert(value >= 0x00n && value <= max, `value must be a positive integer between 0 and ${max.toString()}`);
        });
    }
    computeBufferSize() {
        return this.values.length * 8;
    }
    get() { return [...this.values]; }
    set(values) {
        this.assertInvariants(values);
        this.values = Object.freeze([...values]);
    }
    toUint8Array() {
        return u64sTou8s(this.values, this.endian === Endian.Little);
    }
}
exports.U64sType = U64sType;
class I64sType {
    constructor(values, endian = Endian.Little) {
        this.assertInvariants(values);
        this.values = Object.freeze([...values]);
        this.endian = endian;
    }
    assertInvariants(values) {
        const min = -0x8000000000000000n;
        const max = 0x7fffffffffffffffn;
        values.forEach(value => {
            assert(value >= min && value <= max, `value must be an integer between ${min.toString()} and ${max.toString()}`);
        });
    }
    computeBufferSize() {
        return this.values.length * 8;
    }
    get() { return [...this.values]; }
    set(values) {
        this.assertInvariants(values);
        this.values = Object.freeze([...values]);
    }
    toUint8Array() {
        return u64sTou8s(this.values.map(normalise64), this.endian === Endian.Little);
    }
}
exports.I64sType = I64sType;
class BaseSizeOf {
    constructor(width, toBytesFn, target, endian = Endian.Little) {
        this.width = width;
        this.toBytesFn = toBytesFn;
        this.target = target;
        this.endian = endian;
    }
    computeBufferSize() { return this.width; }
    toUint8Array() {
        return this.toBytesFn([this.target.computeBufferSize()], this.endian === Endian.Little);
    }
    get() {
        return this.target.computeBufferSize();
    }
}
class SizeOf8Type extends BaseSizeOf {
    constructor(target, endian = Endian.Little) {
        super(1, u8sTou8s, target, endian);
    }
}
class SizeOf16Type extends BaseSizeOf {
    constructor(target, endian = Endian.Little) {
        super(2, u16sTou8s, target, endian);
    }
}
class SizeOf32Type extends BaseSizeOf {
    constructor(target, endian = Endian.Little) {
        super(4, u32sTou8s, target, endian);
    }
}
class SizeOf64Type {
    constructor(target, endian = Endian.Little) {
        this.target = target;
        this.endian = endian;
    }
    computeBufferSize() { return 8; }
    toUint8Array() {
        const bufferSize = BigInt(this.target.computeBufferSize());
        return u64sTou8s([bufferSize], this.endian === Endian.Little);
    }
    get() {
        return BigInt(this.target.computeBufferSize());
    }
}
exports.SizeOf64Type = SizeOf64Type;
class BasePointer {
    constructor(width, toBytesFn, target, path, endian = Endian.Little) {
        this.width = width;
        this.toBytesFn = toBytesFn;
        assert(pathRegex.test(path), `Path "${path}" is not valid`);
        this.target = target;
        this.path = path;
        this.endian = endian;
    }
    computeBufferSize() { return this.width; }
    toUint8Array() {
        return this.toBytesFn([this.target.getDeepOffset(this.path)], this.endian === Endian.Little);
    }
    get() {
        return this.target.getDeepOffset(this.path);
    }
}
class Pointer8Type extends BasePointer {
    constructor(target, path, endian = Endian.Little) {
        super(1, u8sTou8s, target, path, endian);
    }
}
class Pointer16Type extends BasePointer {
    constructor(target, path, endian = Endian.Little) {
        super(2, u16sTou8s, target, path, endian);
    }
}
class Pointer32Type extends BasePointer {
    constructor(target, path, endian = Endian.Little) {
        super(4, u32sTou8s, target, path, endian);
    }
}
class Pointer64Type {
    constructor(target, path, endian = Endian.Little) {
        assert(pathRegex.test(path), `Path "${path}" is not valid`);
        this.target = target;
        this.path = path;
        this.endian = endian;
    }
    computeBufferSize() { return 8; }
    toUint8Array() {
        const offset = BigInt(this.target.getDeepOffset(this.path));
        return u64sTou8s([offset], this.endian === Endian.Little);
    }
    get() {
        return BigInt(this.target.getDeepOffset(this.path));
    }
}
exports.Pointer64Type = Pointer64Type;
class RawStringType {
    constructor(value) {
        this.value = value;
    }
    computeBufferSize() { return this.value.length; }
    toUint8Array() {
        return u8sTou8s(this.value.split('').map(x => x.charCodeAt(0)));
    }
    set(value) {
        this.value = value;
    }
    get() { return this.value; }
}
exports.RawStringType = RawStringType;
class NullTerminatedStringType {
    constructor(value) {
        this.value = value;
    }
    computeBufferSize() { return this.value.length + 1; }
    toUint8Array() {
        return u8sTou8s([...this.value.split('').map(x => x.charCodeAt(0)), 0]);
    }
    set(value) {
        this.value = value;
    }
    get() { return this.value; }
}
exports.NullTerminatedStringType = NullTerminatedStringType;
const Struct = (name, alignment = StructAlignment.Packed, paddingDirection = AlignmentPadding.AfterData) => (new StructType(name, alignment, paddingDirection));
exports.Struct = Struct;
const U8 = (value) => new U8Type(value);
exports.U8 = U8;
const U16 = (value, endian = Endian.Little) => new U16Type(value, endian);
exports.U16 = U16;
const U32 = (value, endian = Endian.Little) => new U32Type(value, endian);
exports.U32 = U32;
const U64 = (value, endian = Endian.Little) => new U64Type(value, endian);
exports.U64 = U64;
const I8 = (value) => new I8Type(value);
exports.I8 = I8;
const I16 = (value, endian = Endian.Little) => new I16Type(value, endian);
exports.I16 = I16;
const I32 = (value, endian = Endian.Little) => new I32Type(value, endian);
exports.I32 = I32;
const I64 = (value, endian = Endian.Little) => new I64Type(value, endian);
exports.I64 = I64;
const U8s = (values) => new U8sType(values);
exports.U8s = U8s;
const U16s = (values, endian = Endian.Little) => new U16sType(values, endian);
exports.U16s = U16s;
const U32s = (values, endian = Endian.Little) => new U32sType(values, endian);
exports.U32s = U32s;
const U64s = (values, endian = Endian.Little) => new U64sType(values, endian);
exports.U64s = U64s;
const I8s = (values) => new I8sType(values);
exports.I8s = I8s;
const I16s = (values, endian = Endian.Little) => new I16sType(values, endian);
exports.I16s = I16s;
const I32s = (values, endian = Endian.Little) => new I32sType(values, endian);
exports.I32s = I32s;
const I64s = (values, endian = Endian.Little) => new I64sType(values, endian);
exports.I64s = I64s;
const SizeOf8 = (target) => new SizeOf8Type(target);
exports.SizeOf8 = SizeOf8;
const SizeOf16 = (target, endian = Endian.Little) => new SizeOf16Type(target, endian);
exports.SizeOf16 = SizeOf16;
const SizeOf32 = (target, endian = Endian.Little) => new SizeOf32Type(target, endian);
exports.SizeOf32 = SizeOf32;
const SizeOf64 = (target, endian = Endian.Little) => new SizeOf64Type(target, endian);
exports.SizeOf64 = SizeOf64;
const Pointer8 = (target, path) => (new Pointer8Type(target, path));
exports.Pointer8 = Pointer8;
const Pointer16 = (target, path, endian = Endian.Little) => (new Pointer16Type(target, path, endian));
exports.Pointer16 = Pointer16;
const Pointer32 = (target, path, endian = Endian.Little) => (new Pointer32Type(target, path, endian));
exports.Pointer32 = Pointer32;
const Pointer64 = (target, path, endian = Endian.Little) => (new Pointer64Type(target, path, endian));
exports.Pointer64 = Pointer64;
const RawString = (value) => new RawStringType(value);
exports.RawString = RawString;
const NullTerminatedString = (value) => new NullTerminatedStringType(value);
exports.NullTerminatedString = NullTerminatedString;
//# sourceMappingURL=index.js.map