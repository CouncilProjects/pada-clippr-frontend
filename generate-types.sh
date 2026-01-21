#!/bin/bash

# Used to fetch the schema from the backend and turn it into types.
backendAccess=http://localhost:8000/
path=api/schema/
outputPath=src/lib/
fileName=api-types.ts

echo "Fetching schema from ${backendAccess}${path}"
curl -fsS "${backendAccess}${path}" -H "Accept: application/json" > openapi-schema.json 
npx openapi-typescript openapi-schema.json -o ${outputPath}${fileName}

echo "Types generated"