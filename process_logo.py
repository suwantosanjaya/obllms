from PIL import Image

# Load the image
img = Image.open('public/logo-icon.png').convert("RGBA")
data = img.getdata()

new_data = []
for item in data:
    r, g, b, a = item
    if a > 0:
        # Check if the pixel is dark (the dark blue parts)
        # If max(r,g,b) is low, it's a dark color
        if max(r, g, b) < 130:
            # Brighten it up significantly
            new_r = min(255, r + 150)
            new_g = min(255, g + 150)
            new_b = min(255, b + 150)
            new_data.append((new_r, new_g, new_b, a))
        else:
            new_data.append(item)
    else:
        new_data.append(item)

img.putdata(new_data)
img.save('public/logo-icon-dark.png')
