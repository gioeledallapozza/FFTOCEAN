# 🌊 FFT Ocean

A real-time ocean simulation built with React Three Fiber, inspired by the beautiful, stylized water of *Sea of Thieves*. 

<img width="2890" height="1726" alt="image" src="https://github.com/user-attachments/assets/218f3676-ee7a-4d42-b13b-009b39e164bf" />

## ✨ Features

* **GPGPU Ocean Waves:** Wave displacement is calculated entirely on the GPU using Fast Fourier Transform (FFT) for smooth 60fps performance.
* **Dynamic Environment:** Features a procedural sky, atmospheric scattering, and real-time environmental reflections on the water surface.
* **Underwater Optics:** Seamless transition when the camera dives underwater, complete with volumetric fog and depth-based color absorption.
* **Procedural Seafloor:** Custom seabed material with animated, dual-sampled light caustics.

## 🚀 Getting Started

To run this project locally on your machine:

```bash
git clone https://github.com/gioeledallapozza/FFTOCEAN.git
cd FFTOCEAN
npm install
npm run dev
```

🛠️ Tweaks & Debug Mode

By default, the user interface is completely hidden to provide a clean, cinematic viewing experience.

If you want to play around with the simulation parameters (like wave amplitude, sun position, water colors, or fog density) and check the performance monitor, just append /#debug to the local/production URL and refresh the page:

http://localhost:5173/#debug

## 💻 Tech Stack

- Core: Three.js, React Three Fiber (R3F)
