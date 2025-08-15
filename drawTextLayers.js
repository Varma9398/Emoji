function drawCanvasImages(ctx, canvas, canvasWidth, canvasHeight, scaleFactor = 1) {
  // Get all canvas images and sort them by z-index
  const canvasImageElements = document.querySelectorAll('.canvas-image');
  
  canvasImageElements.forEach(imageContainer => {
    try {
      const img = imageContainer.querySelector('img');
      if (!img || !img.complete) return;
      
      const rect = imageContainer.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      
      // Calculate position and size relative to canvas
      const x = (rect.left - canvasRect.left) * (canvasWidth / canvas.offsetWidth);
      const y = (rect.top - canvasRect.top) * (canvasHeight / canvas.offsetHeight);
      const width = rect.width * (canvasWidth / canvas.offsetWidth);
      const height = rect.height * (canvasHeight / canvas.offsetHeight);
      
      // Create a temporary canvas to apply filters
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // Draw the image to the temporary canvas
      tempCtx.drawImage(img, 0, 0, width, height);
      
      // Apply filters if any
      const style = img.style;
      if (style.filter) {
        tempCtx.filter = style.filter;
      }
      
      // Draw the filtered image to the main canvas
      ctx.drawImage(tempCanvas, x, y, width, height);
    } catch (err) {
      console.error('Error processing canvas image for export:', err);
      // Continue with other images
    }
  });
}

function drawTextLayers(ctx, canvas, canvasWidth, canvasHeight, scaleFactor = 1) {
  // Get all text layers and sort them by z-index (background first, then normal, then foreground)
  const textLayers = Array.from(document.querySelectorAll('.text-overlay'));
  
  // Sort by z-index: background (5) first, then normal (10), then foreground (20)
  textLayers.sort((a, b) => {
    const aZIndex = a.classList.contains('background') ? 5 : 
                   a.classList.contains('foreground') ? 20 : 10;
    const bZIndex = b.classList.contains('background') ? 5 : 
                   b.classList.contains('foreground') ? 20 : 10;
    return aZIndex - bZIndex;
  });
  
  textLayers.forEach(textLayer => {
    try {
      const rect = textLayer.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(textLayer);
      
      // Calculate position relative to canvas
      const x = (rect.left - canvasRect.left) * (canvasWidth / canvas.offsetWidth);
      const y = (rect.top - canvasRect.top) * (canvasHeight / canvas.offsetHeight);
      
      // Get text content (without control handles)
      const textContent = Array.from(textLayer.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent)
        .join('');
      
      if (!textContent.trim()) return;
      
      // Set text properties
      const fontSize = parseInt(computedStyle.fontSize) * (canvasWidth / canvas.offsetWidth);
      const fontFamily = computedStyle.fontFamily;
      const fontWeight = computedStyle.fontWeight;
      const fontStyle = computedStyle.fontStyle;
      const textAlign = computedStyle.textAlign;
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      const textShadow = computedStyle.textShadow;
      
      // Draw background if not transparent
      if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
        const padding = 8;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(x - padding/2, y - padding, textLayer.offsetWidth + padding, textLayer.offsetHeight + padding);
      }
      
      // Set font
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';
      
      // Set text alignment
      let textX = x;
      if (textAlign === 'center') {
        textX = x + textLayer.offsetWidth / 2;
        ctx.textAlign = 'center';
      } else if (textAlign === 'right') {
        textX = x + textLayer.offsetWidth;
        ctx.textAlign = 'right';
      } else {
        ctx.textAlign = 'left';
      }
      
      // Apply text shadow
      if (textShadow && textShadow !== 'none') {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }
      
      // Draw text
      ctx.fillText(textContent, textX, y);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } catch (err) {
      console.error('Error processing text layer for canvas:', err);
      // Continue with other text layers
    }
  });
}