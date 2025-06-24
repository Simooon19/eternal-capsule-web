# 📋 Funeral Home User Guide - Eternal Capsule

This guide covers how funeral homes can efficiently use Eternal Capsule's bulk memorial creation and CSV import features.

## 🚀 Quick Start for Funeral Homes

### Prerequisites
- Funeral Home or Enterprise plan subscription
- Admin access to your funeral home account
- Client data in spreadsheet format (optional)

### Accessing Funeral Home Tools
1. **Log in** to your Eternal Capsule account
2. **Navigate** to your Dashboard
3. **Look for** the "🏢 Funeral Home Tools" section
4. **Click** "CSV Import" to bulk upload memorials

---

## 📄 CSV Import System

### Overview
The CSV import system allows funeral homes to create multiple memorials at once from existing client data, saving significant time compared to individual memorial creation.

### Key Features
- **Bulk creation** of up to 50 memorials per upload
- **Template download** with proper formatting
- **Live preview** before import
- **Validation** with error detection
- **Automatic NFC tag** generation for each memorial
- **Family notifications** when memorials are approved

---

## 📊 CSV Format Requirements

### Required Columns
```csv
name,born,died
John Doe,1950-05-15,2023-12-01
Jane Smith,1955-08-20,2023-11-15
```

### Complete Format (All Columns)
```csv
name,born,died,birthLocation,deathLocation,description,familyEmail,tags
John Doe,1950-05-15,2023-12-01,New York NY,San Francisco CA,A loving father and devoted husband,family@example.com,father|husband|veteran
Jane Smith,1955-08-20,2023-11-15,Chicago IL,Chicago IL,A beloved teacher and community leader,jane.family@example.com,teacher|community-leader
Robert Johnson,1942-03-10,2023-10-30,Boston MA,Miami FL,A skilled carpenter and grandfather,robert.family@example.com,grandparent|business-owner
```

### Column Specifications

| Column | Required | Format | Example | Notes |
|--------|----------|--------|---------|-------|
| `name` | ✅ Yes | Text | "John Doe" | Full name of deceased |
| `born` | ✅ Yes | YYYY-MM-DD | "1950-05-15" | Birth date |
| `died` | ✅ Yes | YYYY-MM-DD | "2023-12-01" | Death date |
| `birthLocation` | ⚪ Optional | Text | "New York, NY" | Birth city/state |
| `deathLocation` | ⚪ Optional | Text | "San Francisco, CA" | Death city/state |
| `description` | ⚪ Optional | Text | "A loving father..." | Memorial description |
| `familyEmail` | ⚪ Optional | Email | "family@example.com" | Contact for notifications |
| `tags` | ⚪ Optional | Text | "father\|veteran\|teacher" | Pipe-separated tags |

### Important Notes
- **Date Format**: Must use YYYY-MM-DD format (ISO 8601)
- **Tags Format**: Separate multiple tags with pipe symbol (\|)
- **Email Format**: Must be valid email addresses for family notifications
- **Text Encoding**: Use UTF-8 encoding for special characters
- **File Size**: Maximum 50 memorials per CSV file

---

## 🎯 Step-by-Step Import Process

### Step 1: Download Template
1. **Navigate** to Dashboard → CSV Import
2. **Click** "Download Template" button
3. **Open** the downloaded CSV file in Excel or Google Sheets
4. **Review** the sample data and format

### Step 2: Prepare Your Data
1. **Replace** sample data with your client information
2. **Ensure** all required fields (name, born, died) are filled
3. **Validate** date formats (YYYY-MM-DD)
4. **Check** email addresses if providing family contacts
5. **Add** relevant tags separated by pipe symbols (\|)

### Step 3: Upload and Preview
1. **Save** your file as CSV format
2. **Return** to the CSV Import page
3. **Click** "Choose CSV file" or drag and drop
4. **Review** the preview table showing parsed data
5. **Check** for any validation errors (highlighted in red)

### Step 4: Import Memorials
1. **Verify** all data looks correct in the preview
2. **Click** "Import Memorials" button
3. **Wait** for processing (may take 1-2 minutes for large batches)
4. **Review** the success/error summary

### Step 5: Post-Import Actions
1. **Check** the admin panel for pending approvals
2. **Approve** memorials individually or in bulk
3. **Verify** family notifications were sent (if emails provided)
4. **Distribute** NFC tags with generated UIDs to families

---

## ⚙️ Admin Panel Management

### Approving Bulk Created Memorials
1. **Navigate** to Admin Panel from dashboard
2. **Look** for memorials with "Bulk Created" badge
3. **Review** memorial content for accuracy
4. **Approve** memorials individually or use bulk actions
5. **Monitor** email notifications to families

### Managing Memorial Status
- **Pending**: Awaiting admin approval
- **Approved**: Live and accessible to families
- **Rejected**: Requires changes before approval
- **Revision**: Needs editing before resubmission

---

## 🔧 Common Data Preparation Tips

### Converting from Funeral Software
Most funeral management software can export client data to CSV:

**Funeral Management Systems**:
- **FuneralTech**: Export → Client Records → CSV Format
- **Osiris**: Reports → Memorial Data → Export CSV
- **FrontRunner**: Data → Export → Memorial Information

### Excel/Google Sheets Tips
1. **Format dates** as YYYY-MM-DD before saving as CSV
2. **Remove** any special formatting (colors, borders)
3. **Ensure** no empty rows between data
4. **Save As** CSV (Comma Separated Values) format
5. **Test** with a small batch (2-3 memorials) first

### Data Quality Checklist
- [ ] All names are complete and properly spelled
- [ ] Birth dates are before death dates
- [ ] Email addresses are valid and current
- [ ] Locations include city and state/country
- [ ] Tags are relevant and properly formatted
- [ ] No duplicate entries

---

## 🚨 Troubleshooting Guide

### Common Upload Errors

#### "Missing required fields: name, born, died"
**Cause**: Required columns are empty or missing
**Solution**: 
- Ensure every row has name, born, and died filled
- Check for empty cells in required columns
- Verify column headers exactly match: `name,born,died`

#### "Invalid date format"
**Cause**: Dates not in YYYY-MM-DD format
**Solution**:
- Convert dates to ISO format (1950-05-15)
- Avoid formats like MM/DD/YYYY or DD-MM-YYYY
- Use Excel's format cells function to convert dates

#### "Invalid email address"
**Cause**: Malformed email in familyEmail column
**Solution**:
- Check for missing @ symbols
- Ensure proper domain format (.com, .org, etc.)
- Remove any extra spaces around email addresses

#### "CSV contains more than 50 memorials"
**Cause**: File exceeds maximum limit
**Solution**:
- Split large files into batches of 50 or fewer
- Process multiple smaller uploads instead
- Contact support for enterprise solutions if needed

#### "Column count mismatch"
**Cause**: Inconsistent number of columns across rows
**Solution**:
- Ensure all rows have the same number of columns
- Check for missing commas in CSV file
- Remove any trailing commas at end of rows

### File Format Issues

#### "Failed to read CSV file"
**Cause**: File encoding or format problems
**Solution**:
- Save as CSV (UTF-8) format
- Avoid using Excel's "CSV (MS-DOS)" format
- Try opening in text editor to check format

#### "No valid memorial data found"
**Cause**: Parser couldn't extract valid records
**Solution**:
- Verify CSV format with template
- Check for proper column headers
- Ensure data starts on row 2 (after headers)

### Import Process Issues

#### "Bulk creation limit reached"
**Cause**: Exceeded rate limits (100 requests/hour)
**Solution**:
- Wait one hour before next upload
- Contact support for higher limits if needed
- Schedule uploads during off-peak hours

#### "Not authorized for bulk creation"
**Cause**: Account doesn't have funeral/enterprise plan
**Solution**:
- Upgrade to Funeral Home plan ($99/month)
- Contact sales for enterprise pricing
- Use individual memorial creation for free accounts

---

## 📊 Plan Limits and Features

### Funeral Home Plan ($99/month)
- **Memorial Limit**: 100 memorials per month
- **CSV Import**: Up to 50 memorials per upload
- **Rate Limit**: 100 requests per hour
- **Support**: Email and phone support
- **Features**: Custom branding, API access, family handoff

### Enterprise Plan ($249/month)
- **Memorial Limit**: Unlimited
- **CSV Import**: Up to 50 memorials per upload
- **Rate Limit**: Unlimited requests
- **Support**: Dedicated account manager
- **Features**: White-label options, custom integrations

---

## 📞 Support and Resources

### Getting Help
- **Email Support**: support@eternalcapsule.com
- **Phone Support**: Available for funeral/enterprise plans
- **Documentation**: Full API and feature documentation
- **Training**: Available for enterprise customers

### Best Practices
1. **Start Small**: Test with 2-3 memorials first
2. **Regular Backups**: Keep copies of your CSV files
3. **Quality Control**: Review data before import
4. **Family Communication**: Notify families about digital memorials
5. **NFC Distribution**: Plan for physical tag distribution

### Integration Options
- **API Access**: Direct integration with your funeral software
- **Webhook Support**: Real-time notifications
- **Custom Solutions**: Available for enterprise customers
- **Training Programs**: Staff onboarding and best practices

---

## 📈 Success Metrics

### Tracking Your Memorial Program
- **Creation Rate**: Memorials created per month
- **Family Engagement**: Guestbook entries and views
- **NFC Scans**: Physical graveside access metrics
- **Family Satisfaction**: Feedback and testimonials

### Optimizing Your Workflow
1. **Batch Processing**: Group memorials by service date
2. **Template Customization**: Create standard descriptions
3. **Tag Standardization**: Use consistent memorial tags
4. **Quality Assurance**: Implement review processes
5. **Family Onboarding**: Provide clear instructions

---

## 🌍 Multi-Language Interface

### Language Support
Eternal Capsule supports multiple languages to serve international funeral homes:

- **English** - Default interface for global markets
- **Swedish (Minnslund)** - Localized interface with regional branding

### Automatic Language Detection
The platform automatically detects the appropriate language based on:
1. **User's geographic location** (IP-based detection)
2. **Browser language preferences**
3. **Manual language selection** (overrides automatic detection)

### Language Switching
**For Funeral Home Staff:**
1. **Look for the language switcher** in the top navigation (🇺🇸 English / 🇸🇪 Svenska)
2. **Click the desired language** to switch the entire interface
3. **Language preference is saved** for future visits
4. **All features work identically** in both languages

**For Family Members:**
- Families accessing memorials will see the interface in their preferred language
- Memorial content appears in the language used during creation
- Guestbook entries can be made in any language

### Localized Features
**Swedish (Minnslund) Interface Includes:**
- Regional branding with "Minnslund" name
- Swedish flag (🇸🇪) in language switcher
- Localized pricing: "Minneslundsbevarandeplaner"
- Swedish contact information and support
- Culturally appropriate memorial terminology

---

*This guide is updated regularly. For the latest features and best practices, visit our documentation portal or contact support.* 