#!/bin/bash

echo "🔧 Fixing Material-UI Icon Import Issues..."

# Step 1: Clear any webpack cache
echo "1. Clearing webpack/build cache..."
rm -rf node_modules/.cache/
rm -rf build/
rm -rf .next/

# Step 2: Look for problematic files
echo "2. Searching for problematic import patterns..."

# Search for any file with very long lines that might contain the massive import
find src/ -name "*.js" -exec awk 'length > 1000' {} + > long_lines.txt 2>/dev/null
if [ -s long_lines.txt ]; then
    echo "⚠️  Found files with very long lines (potential massive imports):"
    cat long_lines.txt
else
    echo "✅ No files with suspiciously long lines found."
fi
rm -f long_lines.txt

# Step 3: Check for any auto-generated files
echo "3. Checking for auto-generated or problematic files..."
find src/ -name "*.js" -exec grep -l "import.*{.*AccessTime.*AddBox.*AddCircle" {} \; 2>/dev/null || echo "No direct matches found"

# Step 4: Look for files importing many icons
echo "4. Looking for files importing many Material-UI icons..."
find src/ -name "*.js" -exec sh -c '
    file="$1"
    if grep -q "from.*@mui/icons-material" "$file"; then
        # Count the number of icon imports in the file
        icon_count=$(grep "from.*@mui/icons-material" "$file" | grep -o "," | wc -l)
        if [ "$icon_count" -gt 20 ]; then
            echo "⚠️  $file has $icon_count icon imports (might be excessive)"
        fi
    fi
' sh {} \;

echo "5. Creating a webpack configuration to help debug..."

# Step 5: Create a temporary webpack configuration for better error reporting
cat > webpack.debug.js << 'EOF'
const path = require('path');

module.exports = {
  mode: 'development',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      },
    ],
  },
  stats: {
    errorDetails: true,
    errors: true,
    warnings: true,
  },
};
EOF

echo "✅ Debug script completed. Now let's try to build and capture the exact error..."