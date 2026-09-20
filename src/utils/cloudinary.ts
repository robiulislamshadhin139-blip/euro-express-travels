/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  resource_type: string;
  created_at: string;
  original_filename?: string;
}

/**
 * Uploads a file directly to Cloudinary using an Unsigned Upload Preset.
 * Tracks live progress percentage.
 */
export async function uploadFileToCloudinary(
  file: File,
  cloudName: string = 'lbbij0gf',
  uploadPreset: string = 'euro_docs',
  folder: string = 'documents',
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    // Determine resource type: 'auto' is best for images and pdfs/documents
    const isImage = file.type.startsWith('image/');
    const resourceType = isImage ? 'image' : 'auto';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (folder) {
      formData.append('folder', folder);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response as CloudinaryUploadResult);
        } catch (e) {
          reject(new Error('ক্লাউডিনারি রেসপন্স পার্স করতে সমস্যা হয়েছে।'));
        }
      } else {
        try {
          const errResponse = JSON.parse(xhr.responseText);
          const errMsg = errResponse?.error?.message || xhr.statusText;
          if (errMsg.toLowerCase().includes('upload preset')) {
            reject(new Error(`ক্লাউডিনারি Upload Preset "${uploadPreset}" পাওয়া যায়নি। অনুগ্রহ করে আপনার Cloudinary ড্যাশবোর্ডে "Unsigned" মোডে এই Preset তৈরি করুন অথবা সেটিংস থেকে পরিবর্তন করুন।`));
          } else {
            reject(new Error(`ক্লাউডিনারি আপলোড ত্রুটি: ${errMsg}`));
          }
        } catch {
          reject(new Error(`আপলোড ব্যর্থ হয়েছে (${xhr.status}): ${xhr.statusText}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('ক্লাউডিনারি সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করুন।'));
    };

    xhr.send(formData);
  });
}
