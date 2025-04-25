# airlookjs
Main monorepo for packages and services in the airlookjs namespace

## File services
Services that expose endpoints to compute information about media files. They share the same configuration structure and cann be consumed as a fastify server instance, a fastify plugin or as low level methods. 
### @airlookjs/loudness
EBU r128 loudness data for media files.

### @airlookjs/scenedetect
Detect scenes in mediafiles.

### @airlookjs/mediainfo
Media metadata usssing the mediainfo package.

## UI
### @airlookjs/svelte-sequence-editor
UI package for time baswed sequence editing.

## Utility
@airlookjs/shared

# Workflow
When making changes in airlookjs shared, you can work with them locally adding `"@airlookjs/shared": "workspace:*"` in the package.json for the project that needs to use it.
When you need to release that change, first push and release your changes for `@airlookjs/shared`, afterward update the reference in the respective projects that use it.
