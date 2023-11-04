# LeanJSX

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MPL--2.0-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

## Overview

LeanJSX is a server-driven library that allows you to build HTML components using JSX-like syntax, but without relying on hefty client-side JavaScript libraries or frameworks.

## Features

- **Server-Driven**: Everything runs on the server, minimizing the JavaScript payload.
- **Streamable**: Outputs HTML in chunks for quicker time-to-first-byte and faster rendering.
- **Asynchronous Components**: Supports async component functions, rendering placeholders while fetching the actual content.
- **Event Handling**: Converts JSX-like event attributes to JavaScript snippets for client-side interactivity.

## Getting Started

### Installation

```bash
npm install lean-jsx
```