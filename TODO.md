# TODO - Fix lecture video upload flow (Cloudinary + Mongo)

## Plan recap
1. Verify lecture upload path uses Cloudinary secure_url + public_id.
2. Ensure lecture objects store only `videoUrl` and `videoPublicId` (no `/uploads` or local filesystem paths).
3. Ensure student watch uses `lecture.videoUrl` and Cloudinary URLs are not rewritten.
4. Verify teacher frontend form field names match multer (`video`).
5. Add logging: Cloudinary upload success, Mongo save fields, API response contains videoUrl.
6. Provide testing steps and sample MongoDB documents.

## Implementation steps
- [x] Inspect and confirm frontend `getAssetUrl` behavior for Cloudinary URLs.
- [x] Patch backend `teacherCourseController.addLecture` and `updateLecture` to:
  - [x] log Cloudinary upload success (secure_url + public_id)
  - [x] log `videoUrl`/`videoPublicId` about to be saved
  - [x] log post-save verification that lecture stores those values
  - [x] ensure API response includes `videoUrl`
  - [x] enforce lecture video required when uploading (and reject local paths)
- [ ] Patch `client/src/utils/urls.js` if it rewrites Cloudinary URLs.
- [ ] Patch `client/src/pages/student/StudentVideoPlayer.jsx` only if needed (guarding).
- [ ] Re-test teacher upload + student playback.
- [ ] Provide final report with modified files + sample MongoDB documents.


