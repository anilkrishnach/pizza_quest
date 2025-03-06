// Browser-compatible wrapper for Construct JS
(function(global) {
    console.log('Initializing Construct JS browser wrapper...');
    
    // Create a canvas element
    class ConstructCanvas {
        constructor(options) {
            console.log('Creating ConstructCanvas with options:', options);
            
            this.container = options.container;
            this.width = options.width || 300;
            this.height = options.height || 150;
            
            // Create canvas element
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.ctx = this.canvas.getContext('2d');
            
            // Append canvas to container
            if (typeof this.container === 'string') {
                this.container = document.getElementById(this.container);
            }
            
            if (!this.container) {
                console.error('Container element not found!');
                return;
            }
            
            // Clear any existing content
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }
            
            this.container.appendChild(this.canvas);
            console.log('Canvas created and appended to container');
        }
        
        // Clear the canvas
        clear() {
            console.log('Clearing canvas...');
            if (!this.ctx) {
                console.error('Canvas context not available!');
                return this;
            }
            this.ctx.clearRect(0, 0, this.width, this.height);
            return this;
        }
        
        // Draw a rectangle
        rect(options) {
            if (!this.ctx) {
                console.error('Canvas context not available!');
                return this;
            }
            
            this.ctx.fillStyle = options.fill || '#000';
            this.ctx.strokeStyle = options.stroke || 'transparent';
            this.ctx.lineWidth = options.lineWidth || 1;
            
            if (options.fill) {
                this.ctx.fillRect(options.x, options.y, options.width, options.height);
            }
            
            if (options.stroke) {
                this.ctx.strokeRect(options.x, options.y, options.width, options.height);
            }
            
            return this;
        }
        
        // Draw a circle
        circle(options) {
            if (!this.ctx) {
                console.error('Canvas context not available!');
                return this;
            }
            
            this.ctx.fillStyle = options.fill || '#000';
            this.ctx.strokeStyle = options.stroke || 'transparent';
            this.ctx.lineWidth = options.lineWidth || 1;
            
            this.ctx.beginPath();
            this.ctx.arc(options.x, options.y, options.radius, 0, Math.PI * 2);
            
            if (options.fill) {
                this.ctx.fill();
            }
            
            if (options.stroke) {
                this.ctx.stroke();
            }
            
            return this;
        }
        
        // Draw text
        text(options) {
            if (!this.ctx) {
                console.error('Canvas context not available!');
                return this;
            }
            
            this.ctx.fillStyle = options.fill || '#000';
            this.ctx.font = options.font || '12px Arial';
            this.ctx.textAlign = options.align || 'left';
            this.ctx.textBaseline = options.baseline || 'top';
            
            this.ctx.fillText(options.text, options.x, options.y);
            
            return this;
        }
        
        // Draw a line
        line(options) {
            if (!this.ctx) {
                console.error('Canvas context not available!');
                return this;
            }
            
            this.ctx.strokeStyle = options.stroke || '#000';
            this.ctx.lineWidth = options.lineWidth || 1;
            
            this.ctx.beginPath();
            this.ctx.moveTo(options.x1, options.y1);
            this.ctx.lineTo(options.x2, options.y2);
            this.ctx.stroke();
            
            return this;
        }
        
        // Draw an image
        drawImage(options) {
            if (!this.ctx) {
                console.error('Canvas context not available!');
                return this;
            }
            
            if (!options.image) {
                console.error('Image not provided for drawImage!');
                return this;
            }
            
            try {
                // Save the current context state
                this.ctx.save();
                
                // Apply rotation if specified
                if (options.rotation !== undefined) {
                    const centerX = options.rotationCenterX || options.x + (options.width / 2);
                    const centerY = options.rotationCenterY || options.y + (options.height / 2);
                    
                    this.ctx.translate(centerX, centerY);
                    this.ctx.rotate(options.rotation * Math.PI / 180);
                    this.ctx.translate(-centerX, -centerY);
                }
                
                // Apply tint if specified
                if (options.tint) {
                    // Create a temporary canvas for tinting
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = options.width;
                    tempCanvas.height = options.height;
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    // Draw the image on the temporary canvas
                    tempCtx.drawImage(options.image, 0, 0, options.width, options.height);
                    
                    // Apply tint
                    tempCtx.fillStyle = options.tint;
                    tempCtx.globalCompositeOperation = 'multiply';
                    tempCtx.fillRect(0, 0, options.width, options.height);
                    
                    // Reset composite operation
                    tempCtx.globalCompositeOperation = 'destination-atop';
                    tempCtx.drawImage(options.image, 0, 0, options.width, options.height);
                    
                    // Draw the tinted image
                    this.ctx.drawImage(tempCanvas, options.x, options.y);
                } else {
                    // Draw the image normally
                    this.ctx.drawImage(
                        options.image,
                        options.x,
                        options.y,
                        options.width,
                        options.height
                    );
                }
                
                // Restore the context state
                this.ctx.restore();
            } catch (error) {
                console.error('Error drawing image:', error);
            }
            
            return this;
        }
    }
    
    // Expose the Construct class globally
    global.Construct = ConstructCanvas;
    console.log('Construct JS browser wrapper initialized successfully');
})(window); 