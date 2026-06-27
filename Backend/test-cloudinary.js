const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dycwak7mq', // ← replace this
  api_key: '192355137953845', // ← replace this
  api_secret: 'y67b1YAdfYddHbtTltXL2GubsS0' // ← replace this
});

console.log('🚀 Starting Cloudinary Integration Test...\n');

(async () => {
  try {
    // STEP 1: Upload sample image
    console.log('📤 Step 1: Uploading sample image...');
    const uploadResult = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      { 
        resource_type: 'auto',
        public_id: 'gc-sample-test'
      }
    );
    
    console.log('✓ Upload successful!');
    console.log(`  Secure URL: ${uploadResult.secure_url}`);
    console.log(`  Public ID: ${uploadResult.public_id}\n`);

    // STEP 2: Get image metadata
    console.log('📊 Step 2: Fetching image metadata...');
    const resourceResult = await cloudinary.api.resource(uploadResult.public_id);
    
    console.log('✓ Metadata retrieved!');
    console.log(`  Width: ${resourceResult.width}px`);
    console.log(`  Height: ${resourceResult.height}px`);
    console.log(`  Format: ${resourceResult.format}`);
    console.log(`  Size: ${resourceResult.bytes} bytes\n`);

    // STEP 3: Transform image with optimization
    console.log('✨ Step 3: Generating optimized version...');
    // f_auto: automatically choose best format (webp for modern browsers)
    // q_auto: automatically choose best quality based on device
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      transformation: [
        {
          fetch_format: 'auto', // f_auto
          quality: 'auto',      // q_auto
          width: 800,
          crop: 'scale'
        }
      ]
    });

    console.log('✓ Transformation applied!');
    console.log(`  What f_auto does: Automatically selects best format (WebP, JPEG, PNG) based on browser`);
    console.log(`  What q_auto does: Automatically selects best quality to balance size vs visual quality\n`);

    console.log('✅ Done! Click link below to see optimized version of the image.');
    console.log(`📸 Transformed URL: ${transformedUrl}\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 Cloudinary Integration is working correctly!');
    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
