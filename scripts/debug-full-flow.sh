#!/bin/bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtaXh6ZHBiejAwMDA1NnE3ZmdpaXkwa3IiLCJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBkZW50YWxhcHAuY29tIiwiaWF0IjoxNzY1MzM1Mzc5LCJleHAiOjE3NjU0MjE3Nzl9.uQdmqvcfDTd4EXv0jqRmOOPMYv_u5Xw1Wj7Acp16llg"

echo "1. Create Client..."
CLIENT_RES=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name": "Flow Test 5", "slug": "flow_test_5", "google": {"serviceAccountPath": ""}, "locations": [{"name": "loc1", "address": "addr", "mapUrl": "url", "google": {"bookingCalendarId": "bid", "availabilityCalendars": []}}], "wassenger": {"apiKey": "wa", "deviceId": "wd"}, "meta": {"accessToken": "ma"}}' http://localhost:3000/api/admin/clients)
echo "Create Res: $CLIENT_RES"

CLIENT_ID=$(echo $CLIENT_RES | grep -o '"id":"[^"]*"' | head -n 1 | cut -d '"' -f 4)
echo "Client ID: $CLIENT_ID"

if [ -n "$CLIENT_ID" ]; then
  echo "2. Upload File..."
  # Create a dummy file if not exists
  echo "{}" > /tmp/dummy_flow.json
  
  UPLOAD_RES=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -F "file=@/tmp/dummy_flow.json" http://localhost:3000/api/admin/clients/$CLIENT_ID/service-account)
  echo "Upload Res: $UPLOAD_RES"
  
  PATH=$(echo $UPLOAD_RES | grep -o '"path":"[^"]*"' | cut -d '"' -f 4)
  echo "Extracted Path: $PATH"

  if [ -n "$PATH" ]; then
      echo "3. Update Client with Path..."
      # Mimic frontend sending full payload + new path
      UPDATE_RES=$(curl -s -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"name\": \"Flow Test\", \"slug\": \"flow_test_1\", \"google\": {\"serviceAccountPath\": \"$PATH\"}, \"locations\": [{\"name\": \"loc1\", \"address\": \"addr\", \"mapUrl\": \"url\", \"google\": {\"bookingCalendarId\": \"bid\", \"availabilityCalendars\": []}}], \"wassenger\": {\"apiKey\": \"wa\", \"deviceId\": \"wd\"}, \"meta\": {\"accessToken\": \"ma\"}}" http://localhost:3000/api/admin/clients/$CLIENT_ID)
      echo "Update Res: $UPDATE_RES"
      
      echo "4. Verify Persistence..."
      GET_RES=$(curl -s -X GET -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/admin/clients/$CLIENT_ID)
      echo "Final Client: $GET_RES"
  else
      echo "Failed to extract path from upload response"
  fi
else
  echo "Failed to create client"
fi
