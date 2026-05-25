export default class Complex {
    constructor(real, imag) {
        this.re = real; // Real part
        this.im = imag; // Imaginary part
    }

    // Calculates the Amplitude (Magnitude / Vector length)
    getAmplitude() {
        return Math.sqrt(this.re * this.re + this.im * this.im); // Pythagorean theorem: sqrt(re^2 + im^2)
    }

    // Calculates the Phase in radians (Vector angle)
    getPhase() {
        return Math.atan2(this.im, this.re);
    }

    // Addition of two complex numbers
    add(other) {
        return new Complex(this.re + other.re, this.im + other.im);
    }

    // Subtraction of two complex numbers
    subtract(other) {
        return new Complex(this.re - other.re, this.im - other.im);
    }

    // Multiplication (fundamental for FFT and phase rotation calculations)
    multiply(other) {
        // (a + ib)(c + id) = ac + iad + ibc - bd
        // = (ac - bd) + i(ad + bc)
        const newRe = (this.re * other.re) - (this.im * other.im);
        const newIm = (this.re * other.im) + (this.im * other.re);
        return new Complex(newRe, newIm);
    }

    toString() {
        return `[Re: ${this.re.toFixed(2)}, Im: ${this.im.toFixed(2)}]`;
    }
}