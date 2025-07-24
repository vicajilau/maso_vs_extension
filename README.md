# MASO File Support

Una extensión de VS Code que proporciona soporte completo para archivos `.maso` con validación JSON, resaltado de sintaxis y diagnósticos en tiempo real.

## Características

- **Reconocimiento automático**: Los archivos `.maso` se reconocen automáticamente como JSON
- **Validación de esquema**: Validación en tiempo real de la estructura MASO
- **Diagnósticos avanzados**: Detecta errores de estructura, campos faltantes y tipos incorrectos
- **Validaciones específicas**:
  - IDs de proceso únicos
  - Tiempos no negativos
  - Modos de procesamiento válidos (regular, priority, round_robin)
- **Resaltado de sintaxis**: Palabras clave específicas de MASO resaltadas
- **Autocompletado**: Sugerencias para campos válidos

## Estructura de archivos MASO

```json
{
  "metadata": {
    "name": "Nombre del proceso",
    "version": "1.0.0",
    "description": "Descripción del proceso"
  },
  "processes": {
    "mode": "regular",
    "elements": [
      {
        "id": "A",
        "arrival_time": 0,
        "service_time": 3,
        "enabled": true
      }
    ]
  }
}
```

## Requisitos

- VS Code 1.102.0 o superior

## Configuración

Esta extensión contribuye con las siguientes configuraciones:

- `maso.validation.enabled`: Habilitar/deshabilitar validación de archivos MASO (por defecto: `true`)
- `maso.validation.strictMode`: Habilitar modo de validación estricto (por defecto: `false`)

## Comandos

- `MASO: Validate File`: Valida manualmente el archivo MASO actual

## Instalación para desarrollo

1. Clonar este repositorio
2. Ejecutar `npm install` para instalar dependencias
3. Presionar `F5` para abrir una nueva ventana de VS Code con la extensión cargada
4. Crear o abrir un archivo `.maso` para probar las funcionalidades

## Desarrollo

- `npm run compile`: Compilar la extensión
- `npm run watch`: Compilar en modo watch
- `npm run test`: Ejecutar tests
- `F5`: Lanzar extensión en modo debug

## Problemas conocidos

Actualmente no hay problemas conocidos. Reporta cualquier problema en el repositorio del proyecto.

## Historial de versiones

### 0.0.1

- Lanzamiento inicial
- Soporte básico para archivos .maso
- Validación de esquema JSON
- Resaltado de sintaxis
- Diagnósticos en tiempo real

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: Enable/disable this extension.
- `myExtension.thing`: Set to `blah` to do something.

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
