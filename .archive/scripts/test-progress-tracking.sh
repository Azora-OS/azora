#!/bin/bash

echo "🎓 Testing Azora OS Progress Tracking System"
echo "============================================="

API_BASE="http://localhost:4000"
AUTH_BASE="http://localhost:3001"

# Login and get token
echo "1. Logging in as test user..."
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@azora.world","password":"ubuntu123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "✅ Logged in successfully"

# Get course with lessons
echo -e "\n2. Getting Ubuntu Philosophy course with lessons..."
COURSE_RESPONSE=$(curl -s "$API_BASE/api/lms/courses/1" \
  -H "Authorization: Bearer $TOKEN")
echo "Course: $(echo $COURSE_RESPONSE | jq -r '.data.title')"
echo "Lessons: $(echo $COURSE_RESPONSE | jq -r '.data.lessons | length')"

# Enroll in course (if not already enrolled)
echo -e "\n3. Enrolling in Ubuntu Philosophy course..."
ENROLL_RESPONSE=$(curl -s -X POST "$API_BASE/api/lms/courses/1/enroll" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "Enrollment: $(echo $ENROLL_RESPONSE | jq -r '.message // .error')"

# Check initial progress
echo -e "\n4. Checking initial progress..."
PROGRESS_RESPONSE=$(curl -s "$API_BASE/api/lms/courses/1/progress" \
  -H "Authorization: Bearer $TOKEN")
echo "Progress: $(echo $PROGRESS_RESPONSE | jq -r '.data.progress.percentage')%"
echo "Completed lessons: $(echo $PROGRESS_RESPONSE | jq -r '.data.progress.completed')/$(echo $PROGRESS_RESPONSE | jq -r '.data.progress.total')"

# Complete first lesson
echo -e "\n5. Completing first lesson..."
COMPLETE_RESPONSE=$(curl -s -X POST "$API_BASE/api/lms/lessons/1/complete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"timeSpent": 25}')
echo "Completion: $(echo $COMPLETE_RESPONSE | jq -r '.message')"

# Check updated progress
echo -e "\n6. Checking updated progress..."
UPDATED_PROGRESS=$(curl -s "$API_BASE/api/lms/courses/1/progress" \
  -H "Authorization: Bearer $TOKEN")
echo "New progress: $(echo $UPDATED_PROGRESS | jq -r '.data.progress.percentage')%"
echo "Completed lessons: $(echo $UPDATED_PROGRESS | jq -r '.data.progress.completed')/$(echo $UPDATED_PROGRESS | jq -r '.data.progress.total')"

# Complete second lesson
echo -e "\n7. Completing second lesson..."
COMPLETE2_RESPONSE=$(curl -s -X POST "$API_BASE/api/lms/lessons/2/complete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"timeSpent": 30}')
echo "Completion: $(echo $COMPLETE2_RESPONSE | jq -r '.message')"

# Final progress check
echo -e "\n8. Final progress check..."
FINAL_PROGRESS=$(curl -s "$API_BASE/api/lms/courses/1/progress" \
  -H "Authorization: Bearer $TOKEN")
echo "Final progress: $(echo $FINAL_PROGRESS | jq -r '.data.progress.percentage')%"
echo "Completed lessons: $(echo $FINAL_PROGRESS | jq -r '.data.progress.completed')/$(echo $FINAL_PROGRESS | jq -r '.data.progress.total')"

echo -e "\n🌟 Ubuntu Learning Journey Complete!"
echo "Individual progress strengthens collective wisdom! 🚀"