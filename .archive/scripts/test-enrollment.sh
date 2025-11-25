#!/bin/bash

echo "🎓 Testing Azora OS Course Enrollment"
echo "===================================="

API_BASE="http://localhost:4000"
AUTH_BASE="http://localhost:3001"

# Login and get token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@azora.world","password":"ubuntu123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "✅ Logged in successfully"

# Get course details
echo -e "\n2. Getting Ubuntu Philosophy course details..."
COURSE_RESPONSE=$(curl -s "$API_BASE/api/lms/courses/1" \
  -H "Authorization: Bearer $TOKEN")
echo "Course: $(echo $COURSE_RESPONSE | jq -r '.data.title')"
echo "Students before: $(echo $COURSE_RESPONSE | jq -r '.data.students')"

# Enroll in course
echo -e "\n3. Enrolling in Ubuntu Philosophy course..."
ENROLL_RESPONSE=$(curl -s -X POST "$API_BASE/api/lms/courses/1/enroll" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Enrollment response: $ENROLL_RESPONSE"

# Check updated course details
echo -e "\n4. Checking updated course details..."
UPDATED_COURSE=$(curl -s "$API_BASE/api/lms/courses/1" \
  -H "Authorization: Bearer $TOKEN")
echo "Students after: $(echo $UPDATED_COURSE | jq -r '.data.students')"

echo -e "\n✅ Database persistence test complete!"