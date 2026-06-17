# DNS_SETUP.md

## Domain: veilory.online

### Hostinger DNS Configuration

1. **Root (@) Record** – Hostinger does **not** support CNAME records at the apex. Use **A records** pointing to Vercel's IP addresses.
   ```
   Type: A
   Host: @
   Value: 76.76.21.21   # Vercel Edge IP (IPv4)
   TTL: 300
   ```
   (You can also add the second Vercel IP `76.76.21.22` for redundancy.)

2. **WWW Sub‑domain** – Create a CNAME that points to the root domain.
   ```
   Type: CNAME
   Host: www
   Value: veilory.online.
   TTL: 300
   ```
   This ensures `www.veilory.online` redirects to the bare domain.

3. **API Sub‑domain (Render)** – Create a CNAME for the backend API.
   ```
   Type: CNAME
   Host: api
   Value: veilory-api.onrender.com.
   TTL: 300
   ```
   Replace `veilory-api.onrender.com` with the actual service URL shown in your Render dashboard.

### Vercel Configuration

- **Add Custom Domain**: In the Vercel dashboard, go to *Settings → Domains* and add `veilory.online`.
- **Verify DNS**: Vercel will provide two A records (`76.76.21.21` & `76.76.21.22`). Ensure they match what you set in Hostinger.
- **Set CNAME for `www`**: Vercel automatically creates a CNAME for the `www` alias once the root domain is verified.
- **Enable HTTPS**: Vercel provisions a free SSL certificate once DNS propagation succeeds.

### Render Configuration

- **Add Custom Domain**: In Render > Services > *veilory-api* → *Custom Domains*, add `api.veilory.online`.
- **Verify DNS**: Render will ask for a CNAME pointing to `<service>.onrender.com`. Use the CNAME record created in Hostinger.
- **Enable HTTPS**: Render automatically provides a TLS certificate for the custom domain.

### Propagation Checklist

- After updating DNS, run `dig A veilory.online` and `dig CNAME api.veilory.online` to confirm the records.
- Both Vercel and Render should show a **Verified** status before you trigger a deployment.

---

**Note**: If you need to change the root domain to a bare CNAME (e.g., using a DNS provider that supports ALIAS/ANAME), you can replace the A records with the CNAME value supplied by Vercel (`cname.vercel-dns.com`). Hostinger currently requires the A‑record approach.
