# VidyaSetu – Fix 413 Payload Too Large

- [ ] Implement server-side upload/request size fixes:
  - [ ] Increase express.json/urlencoded limits to match multipart upload needs
  - [ ] Add an explicit body size limit handler for 413 with clear JSON message
  - [ ] Increase multer limits (fileSize) and align with expected Render limits
- [ ] Fix client payload size inefficiency (if any): ensure FormData only sends required fields
- [ ] Add/verify error logging for upload failures (multer + 413)
- [ ] Test:
  - [ ] Create course without video
  - [ ] Create course with thumbnail
  - [ ] Add lecture with video
  - [ ] Confirm /teacher/courses page works on Render without 413

