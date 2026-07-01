import axios from 'axios';

export type CloudinaryUploadResponse = {
  asset_id: string;
  public_id: string;
  resource_type: string;
  format: string;
  secure_url: string;
  url: string;
  bytes?: number;
  original_filename?: string;
  [key: string]: unknown;
};

export type CloudinaryUploadVerification = {
  verified: boolean;
  status: number;
  contentType: string;
  contentLength: number;
  verifiedUrl: string;
};

function getCloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    throw new Error('Cloudinary configuration missing: VITE_CLOUDINARY_CLOUD_NAME is not defined. Please set it in your .env file.');
  }

  if (!uploadPreset) {
    throw new Error('Cloudinary configuration missing: VITE_CLOUDINARY_UPLOAD_PRESET is not defined. Please set it in your .env file.');
  }

  return { cloudName, uploadPreset };
}

function buildUploadUrl(cloudName: string, resourceType: string) {
  return `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
}

export function validatePdf(file: File): boolean {
  return file.type === 'application/pdf' && file.size > 0;
}

export async function uploadInvoiceToCloudinary(file: File, folder = 'Shrujay/Bills'): Promise<CloudinaryUploadResponse> {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  const uploadUrl = buildUploadUrl(cloudName, 'raw');

  if (!validatePdf(file)) {
    throw new Error(`Invalid PDF file. File name: ${file.name}, type: ${file.type}, size: ${file.size}`);
  }

  console.info('[Cloudinary] Preparing upload');
  console.info(`  File name: ${file.name}`);
  console.info(`  File size: ${file.size} bytes`);
  console.info(`  Mime type: ${file.type}`);
  console.info(`  Cloud name: ${cloudName}`);
  console.info(`  Upload preset: ${uploadPreset}`);
  console.info(`  Upload URL: ${uploadUrl}`);
  console.info(`  Folder: ${folder}`);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  try {
    const response = await axios.post<CloudinaryUploadResponse>(uploadUrl, formData, {
      onUploadProgress: event => {
        if (event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          console.info(`[Cloudinary] Upload progress: ${percent}%`);
        }
      },
      timeout: 30000,
    });

    const data = response.data;
    console.info('[Cloudinary] Full response:', data);
    console.info('Cloudinary Upload Success');
    console.info(`  Resource Type: ${data.resource_type}`);
    console.info(`  Format: ${data.format}`);
    console.info(`  Public ID: ${data.public_id}`);
    console.info(`  Secure URL: ${data.secure_url}`);
    console.info(`  URL: ${data.url}`);
    console.info(`  Bytes: ${data.bytes}`);
    console.info(`  Original Filename: ${data.original_filename}`);

    if (!data.secure_url || !data.secure_url.startsWith('https://res.cloudinary.com/')) {
      throw new Error(`Cloudinary upload returned an invalid secure_url: ${String(data.secure_url)}`);
    }

    return {
      ...data,
      secure_url: data.secure_url,
      url: typeof data.url === 'string' && data.url.length > 0 ? data.url : data.secure_url,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 'unknown';
      const statusText = error.response?.statusText ?? 'unknown';
      const responseBody = error.response?.data ?? error.message;
      const message = `[Cloudinary Error] Status ${status} ${statusText} - ${JSON.stringify(responseBody)}`;
      console.error(message);
      throw new Error(message);
    }

    throw error instanceof Error ? error : new Error('Unknown Cloudinary upload error');
  }
}

export async function verifyCloudinaryPdf(secureUrl: string): Promise<CloudinaryUploadVerification> {
  if (!secureUrl || !secureUrl.startsWith('https://res.cloudinary.com/')) {
    throw new Error(`verifyCloudinaryPdf expects a valid Cloudinary secure_url, got: ${String(secureUrl)}`);
  }

  async function createResult(response: { status: number; headers: Record<string, unknown>; data?: Blob }) {
    const status = response.status;
    const contentType = String(response.headers['content-type'] ?? response.data?.type ?? '');
    const contentLength = Number(response.headers['content-length'] ?? response.data?.size ?? 0);
    const verified = status === 200 && contentType.includes('application/pdf') && contentLength > 0;

    return {
      verified,
      status,
      contentType,
      contentLength,
      verifiedUrl: secureUrl,
    };
  }

  try {
    console.info('[Cloudinary Verification] Secure URL:', secureUrl);

    const headResponse = await axios.head(secureUrl, {
      timeout: 20000,
      validateStatus: () => true,
    });

    console.info('[Cloudinary Verification] HEAD URL:', secureUrl);
    console.info('[Cloudinary Verification] HEAD Status:', headResponse.status);
    console.info('[Cloudinary Verification] HEAD Content-Type:', headResponse.headers['content-type']);
    console.info('[Cloudinary Verification] HEAD Content-Length:', headResponse.headers['content-length']);

    if (headResponse.status === 401) {
      throw new Error(
        "Invoice storage is not publicly accessible yet. Enable 'PDF delivery' in Cloudinary Settings → Security, then retry."
      );
    }

    const headVerified = headResponse.status === 200 &&
      String(headResponse.headers['content-type'] ?? '').includes('application/pdf') &&
      Number(headResponse.headers['content-length'] ?? 0) > 0;

    if (headVerified) {
      return createResult(headResponse);
    }

    console.info('[Cloudinary Verification] HEAD failed, falling back to GET.');
    const getResponse = await axios.get<Blob>(secureUrl, {
      timeout: 30000,
      responseType: 'blob',
      validateStatus: () => true,
    });

    console.info('[Cloudinary Verification] GET URL:', secureUrl);
    console.info('[Cloudinary Verification] GET Status:', getResponse.status);
    console.info('[Cloudinary Verification] GET Content-Type:', getResponse.headers['content-type']);
    console.info('[Cloudinary Verification] GET Blob Type:', getResponse.data?.type);
    console.info('[Cloudinary Verification] GET Blob Size:', getResponse.data?.size);

    return createResult(getResponse);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const contentType = String(error.response?.headers?.['content-type'] ?? '');
      const contentLength = Number(error.response?.headers?.['content-length'] ?? 0);
      const message = `[Cloudinary Verification Error] Status ${status} - ${error.message}`;
      console.error(message);
      console.error('Response headers:', error.response?.headers);
      return {
        verified: false,
        status,
        contentType,
        contentLength,
        verifiedUrl: url,
      };
    }

    console.error('[Cloudinary Verification Error]', error);
    return {
      verified: false,
      status: 0,
      contentType: '',
      contentLength: 0,
      verifiedUrl: url,
    };
  }
}
