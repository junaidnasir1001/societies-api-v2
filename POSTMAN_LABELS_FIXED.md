# Postman Collection - Labels Fixed for New UI ✅

## 🎯 **Updated Test Case Names**

### **Basic Tests**
1. **Health Check** - Server status verification
2. **API Info** - Authentication and API details

### **Content Type Tests**
3. **Email Subject Lines - Single String (Backward Compatible)** - Legacy format
4. **Email Subject Lines - Multiple Strings (New Format)** - New array format
5. **Meta Ad Headlines - Multiple Strings** - New content type

### **Audience Tests (All 8 Audiences)**
6. **UK HR Decision-Makers Audience** - HR professionals
7. **UK Mortgage Advisors Audience** - Financial advisors
8. **UK Beauty Lovers Audience** - Consumer beauty market
9. **UK Marketing Leaders Audience** - Marketing professionals
10. **UK Enterprise Marketing Leaders Audience** - Enterprise marketing
11. **UK Consumers Audience** - General consumer market

### **Advanced Tests**
12. **Maximum Test Strings - 10 Lines** - Limit testing
13. **Check Job Status** - Monitor job progress

### **Error Tests**
14. **Error Test - Invalid API Key** - Authentication errors
15. **Error Test - Missing Required Fields** - Validation errors
16. **Error Test - Invalid Job ID** - Job status errors

## 📝 **Postman Body Examples for New UI**

### **1. Email Subject Lines (Single String)**
```json
{
  "testType": "email_subject",
  "testString": "Get 50% off today!\nLimited time offer\nSave big this weekend",
  "societyName": "UK Marketing Leaders",
  "mode": "async"
}
```

### **2. Email Subject Lines (Multiple Strings)**
```json
{
  "testType": "email_subject",
  "testStrings": [
    "Your order is ready for pickup",
    "Don't miss out on this deal",
    "Exclusive offer just for you"
  ],
  "societyName": "UK Marketing Leaders",
  "mode": "async"
}
```

### **3. Meta Ad Headlines (Multiple Strings)**
```json
{
  "testType": "meta_ad",
  "testStrings": [
    "Transform your business today",
    "Unlock your potential",
    "Join thousands of successful entrepreneurs"
  ],
  "societyName": "UK Enterprise Marketing Leaders",
  "mode": "async"
}
```

### **4. HR Decision-Makers**
```json
{
  "testType": "email_subject",
  "testString": "New HR software solution\nStreamline your processes\nReduce admin time by 50%",
  "societyName": "UK HR Decision-Makers",
  "mode": "async"
}
```

### **5. Mortgage Advisors**
```json
{
  "testType": "meta_ad",
  "testString": "Mortgage rates dropping\nBest deals available now\nLock in your rate today",
  "societyName": "UK Mortgage Advisors",
  "mode": "async"
}
```

### **6. Beauty Lovers**
```json
{
  "testType": "email_subject",
  "testString": "New beauty collection\nLimited edition products\nFree shipping on orders over £50",
  "societyName": "UK Beauty Lovers",
  "mode": "async"
}
```

### **7. Marketing Leaders**
```json
{
  "testType": "email_subject",
  "testString": "Boost your marketing ROI\nIncrease conversion rates\nDrive more sales",
  "societyName": "UK Marketing Leaders",
  "mode": "async"
}
```

### **8. Enterprise Marketing Leaders**
```json
{
  "testType": "meta_ad",
  "testString": "Enterprise solutions that scale\nROI-focused strategies\nProven results for large organizations",
  "societyName": "UK Enterprise Marketing Leaders",
  "mode": "async"
}
```

### **9. Consumers**
```json
{
  "testType": "email_subject",
  "testString": "Special offer just for you\nLimited time deal\nSave money today",
  "societyName": "UK Consumers",
  "mode": "async"
}
```

## 🎯 **Key Features of Updated Collection**

### **✅ Correct Labels**
- All test names match the new UI exactly
- Audience names use full display names
- Content types use proper terminology

### **✅ Complete Coverage**
- All 8 audience types included
- Both content types (Email subject, Meta ad)
- Both input formats (single string, array)
- Error testing scenarios

### **✅ New UI Specific**
- Content type: `email_subject` and `meta_ad`
- Audience names: Full UK audience names
- Input format: Both `testString` and `testStrings` array
- Mode: Always `async` for job processing

## 🚀 **Ready to Use**

The Postman collection now has:
- ✅ Correct labels matching new UI
- ✅ All 8 audience types
- ✅ Both content types
- ✅ Both input formats
- ✅ Error testing
- ✅ Job status monitoring

**Your Postman collection is now perfectly aligned with the new UI!** 🎉
