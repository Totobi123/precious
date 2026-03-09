# Precious Chic Nails - Project Status

## 🚀 Current Status & Features

This project has been heavily customized and is currently live at **http://genxflow.store:3456**.

### Recently Implemented Features:
- **Base64 Image Management**: Admins can now import images directly from their devices in the Products panel. Images are converted to Base64 and saved directly to the database, removing the dependency on external storage buckets.
- **Full Order Lifecycle**:
    - **Checkout**: A fully functional checkout page (`/checkout`) that saves orders and order items to Supabase.
    - **User Profile**: A new `/profile` page where logged-in users can view their order history and track shipments.
    - **Admin Order Control**: Enhanced Orders panel for admins to view shipping locations, contact customers via email, and update live tracking numbers.
- **Mobile Optimization**:
    - Hero image is now fully responsive and visible on all mobile devices.
    - Added lazy-loading and Base64 fallbacks for all product images to ensure a smooth mobile experience even on slow connections.
- **Custom Branding**:
    - Removed all "Lovable" branding from metadata and SEO tags.
    - Replaced the default favicon with a custom 💅 SVG.

### Deployment Details:
- **Server IP**: `62.171.190.8`
- **Domain**: `genxflow.store` (running on port 3456)
- **Process Manager**: Managed via **PM2** (process name: `precious-nails`).
- **Database**: Connected to Supabase (Project ID: `jracsdjjdrryqpcxhgsf`).

## 🛠 How to Continue Development

### 1. Resume the Server
The server is managed by PM2. To check status or restart:
```sh
npx pm2 status
npx pm2 restart precious-nails
```

### 2. Pushing to GitHub
GitHub password authentication is disabled. To push to the new `precious2` repository, use a Personal Access Token (PAT):
```sh
git remote add origin2 https://github.com/Totobi123/precious2.git
git push -u origin2 main
```

### 3. Key Files
- `src/pages/admin/Products.tsx`: Image upload and product management logic.
- `src/pages/admin/Orders.tsx`: Admin order tracking and customer contact.
- `src/pages/Checkout.tsx`: Order creation logic.
- `src/pages/Profile.tsx`: Customer order history and tracking view.
