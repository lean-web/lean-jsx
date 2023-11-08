# LeanJSX

![License](https://img.shields.io/badge/license-MPL--2.0-blue)
![Version](https://img.shields.io/badge/version-0.0.6--alpha-orange)

## Overview

LeanJSX is a server-driven library that allows you to build HTML components using JSX-like syntax, but without relying on hefty client-side JavaScript libraries or frameworks.

## Features

- **Server-Driven**: Everything runs on the server, minimizing the JavaScript payload.
- **Streamable**: Outputs HTML in chunks for quicker time-to-first-byte and faster rendering.
- **Asynchronous Components**: Supports async component functions, rendering placeholders while fetching the actual content.
- **Event Handling**: Converts JSX-like event attributes to JavaScript snippets for client-side interactivity.

## Getting Started

### Installation

To create a project using LeanJSX, use the `create-lean-jsx-app` generator:

```bash
npx create-lean-jsx-app@latest <dir>
```

Replace `<dir>` with the name of the directory you want the generator to create with the project

## Usage documentation

You can find the usage documentation for LeanJSX here:
https://lean-web.github.io/lean-jsx/