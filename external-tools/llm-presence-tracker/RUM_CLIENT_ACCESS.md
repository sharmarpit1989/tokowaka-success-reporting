# RUM API Access for Client Sites (Like Maruti Suzuki)

## 🎯 You Have Client RUM Credentials!

If your client (e.g., Maruti Suzuki) gave you access to their RUM data, here's how to use it:

---

## 🔑 Two Types of RUM Keys

### **Option 1: Admin Key** (Most Common)
Full access to all domains under the client's account.

```powershell
# Set the admin key
$env:RUM_ADMIN_KEY = "client-provided-admin-key"

# Run analysis
node main-rum.js --domain www.marutisuzuki.com
```

### **Option 2: Domain-Specific Key**
Access to only one specific domain.

```powershell
# Set BOTH keys
$env:RUM_ADMIN_KEY = "dummy-or-leave-empty"
$env:RUM_DOMAIN_KEY = "client-provided-domain-key"

# Run analysis
node main-rum.js --domain www.marutisuzuki.com
```

---

## ✅ **Step-by-Step Setup for Maruti Suzuki**

### **Step 1: Open PowerShell in Your Project Directory**

```powershell
cd "C:\Users\arsharma\OneDrive - Adobe\#Official\Customer Engineering\Automations\EXPERIMENTAL_llm-presence-tracker"
```

### **Step 2: Set the RUM Key**

**If you have an Admin Key:**
```powershell
$env:RUM_ADMIN_KEY = "paste-maruti-rum-admin-key-here"
```

**If you have a Domain-Specific Key:**
```powershell
$env:RUM_ADMIN_KEY = "dummy"
$env:RUM_DOMAIN_KEY = "paste-maruti-rum-domain-key-here"
```

### **Step 3: Verify Keys are Set**

```powershell
# Should show your key
echo $env:RUM_ADMIN_KEY

# If using domain key
echo $env:RUM_DOMAIN_KEY
```

### **Step 4: Run Analysis**

```powershell
node main-rum.js --domain www.marutisuzuki.com
```

---

## 🎬 **Complete Example Session**

```powershell
# Navigate to project
cd "C:\Users\arsharma\OneDrive - Adobe\#Official\Customer Engineering\Automations\EXPERIMENTAL_llm-presence-tracker"

# Set Maruti's RUM key
$env:RUM_ADMIN_KEY = "abc123xyz789-maruti-rum-key"

# Verify it's set (should print the key)
echo $env:RUM_ADMIN_KEY

# Run analysis for last 30 days
node main-rum.js --domain www.marutisuzuki.com --days 30

# Analyze last 7 days only
node main-rum.js --domain www.marutisuzuki.com --days 7

# High traffic pages only
node main-rum.js --domain www.marutisuzuki.com --min-traffic 10000

# Find opportunities
node main-rum.js --domain www.marutisuzuki.com --mode opportunities
```

---

## 🔍 **Troubleshooting**

### **Error: "RUM_ADMIN_KEY not set"**

**Problem:** Key not set in current PowerShell session

**Solution:**
```powershell
# Set it again
$env:RUM_ADMIN_KEY = "your-key-here"

# Verify
echo $env:RUM_ADMIN_KEY
```

**Note:** Environment variables are **session-specific**. If you close PowerShell and reopen it, you need to set them again.

---

### **Error: "No RUM data found for this domain"**

**Possible Causes:**
1. Wrong domain name format
2. Domain not registered in their RUM system
3. Wrong RUM key
4. No data for the time period

**Solutions:**

**1. Try different domain formats:**
```powershell
# Try without www
node main-rum.js --domain marutisuzuki.com

# Try with www
node main-rum.js --domain www.marutisuzuki.com

# Try different subdomain
node main-rum.js --domain nexa.marutisuzuki.com
```

**2. Check if domain has RUM tracking:**
- Visit the website
- Open browser DevTools (F12)
- Check Network tab for `rum` or `bundles.aem.page` calls
- If you see these, RUM is installed

**3. Verify with client:**
- Ask them: "What exact domain is registered in RUM?"
- Ask them: "Is this an Admin Key or Domain Key?"
- Ask them: "Can you confirm the key is active?"

---

### **Error: "Query failed" or "403 Forbidden"**

**Problem:** Key doesn't have access to this domain

**Solution:**
1. Verify the key is correct
2. Ask client to grant access to their domain
3. Confirm you're using the right type of key

---

## 🎯 **What You Get with Client RUM Access**

When it works, you'll get:

```
📊 Top 50 URLs by Priority:

1. https://www.marutisuzuki.com/swift
   Views: 45,000, Organic: 32,000 (71.1%)
   Engagement: 62.0%, Priority: 876.3
   Core Web Vitals: LCP=2100ms, CLS=0.012

2. https://www.marutisuzuki.com/brezza
   Views: 40,000, Organic: 28,000 (70.0%)
   Engagement: 58.0%, Priority: 823.1
   Core Web Vitals: LCP=2500ms, CLS=0.05

... and 48 more URLs ...
```

**All automatically from RUM - no CSV needed!**

---

## 💡 **Pro Tips**

### **Tip 1: Save Your Key Permanently**

Create a script file to set keys quickly:

**Create: `set-maruti-rum-key.ps1`**
```powershell
# Maruti Suzuki RUM Credentials
$env:RUM_ADMIN_KEY = "your-maruti-rum-key"
Write-Host "✅ Maruti Suzuki RUM key loaded!"
```

**Usage:**
```powershell
# Source the script
. .\set-maruti-rum-key.ps1

# Now run analysis
node main-rum.js --domain www.marutisuzuki.com
```

### **Tip 2: Analyze Multiple Client Domains**

If Maruti has multiple domains:
```powershell
# Set key once
$env:RUM_ADMIN_KEY = "maruti-key"

# Analyze all their domains
node main-rum.js --domain www.marutisuzuki.com
node main-rum.js --domain nexa.marutisuzuki.com
node main-rum.js --domain arena.marutisuzuki.com
```

### **Tip 3: Weekly Automated Reports**

Create a weekly report script:

**Create: `weekly-maruti-report.ps1`**
```powershell
# Set credentials
$env:RUM_ADMIN_KEY = "maruti-key"

# Run weekly analysis
$date = Get-Date -Format "yyyy-MM-dd"
Write-Host "Running Maruti Suzuki weekly report for $date"

node main-rum.js --domain www.marutisuzuki.com --days 7 --max-urls 30

Write-Host "Report complete! Check output folder."
```

---

## ✅ **Checklist: Is RUM Working?**

- [ ] RUM key provided by client
- [ ] Key set in PowerShell: `$env:RUM_ADMIN_KEY`
- [ ] Verified key is set: `echo $env:RUM_ADMIN_KEY`
- [ ] Correct domain name (check with client)
- [ ] Domain has RUM tracking installed (check browser DevTools)
- [ ] Running in correct PowerShell session

---

## 🆚 **RUM Mode vs CSV Mode for Maruti**

### **With RUM Access:**
```powershell
# ✅ Fast and automatic
node main-rum.js --domain www.marutisuzuki.com
# Takes: 2-3 minutes
# Gets: All traffic data automatically
```

### **Without RUM Access:**
```powershell
# ⚠️ Manual CSV creation needed
node main.js --csv samples/marutisuzuki-urls.csv
# Takes: 30-40 minutes (CSV creation time)
# Gets: Only URLs you manually added
```

**If you have RUM access, USE IT!** It's much faster!

---

## 📞 **Getting Help**

If still having issues:

1. **Check with Maruti:**
   - "Can you confirm the RUM admin key?"
   - "What domain is registered in RUM?"
   - "Can you test the key on your side?"

2. **Check Adobe RUM docs:**
   - [RUM API Client README](https://github.com/adobe/spacecat-shared/tree/main/packages/spacecat-shared-rum-api-client)

3. **Fallback to CSV mode:**
   ```powershell
   node main.js --csv samples/marutisuzuki-urls.csv
   ```

---

## 🎉 **You're All Set!**

With client RUM access, you get:
- ✅ Automatic traffic data
- ✅ Core Web Vitals
- ✅ Engagement metrics
- ✅ Smart prioritization
- ✅ No CSV creation needed!

**This is WAY better than manual CSV mode!** 🚀

