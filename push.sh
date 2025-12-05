#!/bin/bash

# Push Script for GitHub

echo "🔍 Adding changes..."
git add .

echo "📝 Commit message:"
read msg

if [ -z "$msg" ]; then
  msg="Updated project"
fi

echo "📦 Committing..."
git commit -m "$msg"

echo "🚀 Pushing to GitHub..."
git push -u origin main

echo "✅ Done!"
