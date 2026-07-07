<?php
require_once __DIR__ . '/includes/functions.php';
requireLogin();

$message = '';
$error = '';

// Handle upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
  $file = $_FILES['image'];
  $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if ($file['error'] === UPLOAD_ERR_OK) {
    if (in_array($file['type'], $allowedTypes)) {
      $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
      // Preserve original filename but prevent overwrites by adding number if needed
      $destName = preg_replace('/[^a-zA-Z0-9\-_\.]/', '_', $file['name']);
      $destPath = __DIR__ . '/../img/' . $destName;
      
      // If file exists, prepend timestamp
      if (file_exists($destPath)) {
        $info = pathinfo($destName);
        $destName = $info['filename'] . '_' . time() . '.' . ($info['extension'] ?? $ext);
        $destPath = __DIR__ . '/../img/' . $destName;
      }
      
      if (move_uploaded_file($file['tmp_name'], $destPath)) {
        $message = 'Image "' . htmlspecialchars($destName) . '" uploaded successfully!';
      } else {
        $error = 'Failed to move uploaded file.';
      }
    } else {
      $error = 'Invalid file type. Allowed: JPG, PNG, GIF, WebP.';
    }
  } else {
    $error = 'Upload error (code: ' . $file['error'] . ').';
  }
}

// Handle delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_image'])) {
  $imgName = basename($_POST['delete_image']);
  $imgPath = __DIR__ . '/../img/' . $imgName;
  if (file_exists($imgPath)) {
    unlink($imgPath);
    $message = 'Image "' . htmlspecialchars($imgName) . '" deleted.';
  }
}

$images = getImageList();

require_once __DIR__ . '/includes/header.php';
?>

<div class="section-header">
  <h1><i class="fa-solid fa-image"></i> Manage Images</h1>
</div>

<?php if ($message): ?>
<div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div>
<?php endif; ?>
<?php if ($error): ?>
<div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
<?php endif; ?>

<!-- Upload form -->
<div class="admin-card">
  <div class="admin-card-header">
    <i class="fa-solid fa-upload"></i> Upload New Image
  </div>
  <div class="admin-card-body">
    <form method="post" enctype="multipart/form-data" id="uploadForm">
      <div class="upload-zone" id="uploadZone">
        <i class="fa-solid fa-cloud-arrow-up"></i>
        <p>Click or drag an image here to upload</p>
        <p style="font-size:0.78rem; color:var(--admin-text-light); margin-top:0.25rem;">
          Supported: JPG, PNG, GIF, WebP &mdash; Max: 10MB
        </p>
      </div>
      <input type="file" name="image" id="fileInput" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none;" required>
      <div id="uploadPreview" style="display:none; margin-top:1rem; text-align:center;">
        <img id="previewImg" style="max-width:200px; max-height:150px; border-radius:8px; border:1px solid var(--admin-border);">
        <p id="previewName" style="margin:0.5rem 0 0; font-size:0.85rem;"></p>
        <button type="submit" class="btn btn-primary" style="margin-top:0.75rem;">
          <i class="fa-solid fa-upload"></i> Upload Image
        </button>
      </div>
    </form>
  </div>
</div>

<!-- Image gallery -->
<div class="admin-card">
  <div class="admin-card-header">
    <i class="fa-solid fa-images"></i> Image Gallery (<?php echo count($images); ?>)
  </div>
  <div class="admin-card-body">
    <?php if (count($images) > 0): ?>
    <div class="image-grid">
      <?php foreach ($images as $img): ?>
      <div class="image-item">
        <img src="../<?php echo $img['path']; ?>" alt="<?php echo htmlspecialchars($img['name']); ?>" loading="lazy">
        <div class="image-info">
          <strong><?php echo htmlspecialchars($img['name']); ?></strong><br>
          <?php echo formatBytes($img['size']); ?>
        </div>
        <div class="image-actions">
          <button class="btn btn-secondary btn-sm" onclick="copyPath('<?php echo $img['path']; ?>')" title="Copy path">
            <i class="fa-solid fa-copy"></i>
          </button>
          <form method="post" style="display:inline;" onsubmit="return confirm('Delete this image?');">
            <input type="hidden" name="delete_image" value="<?php echo htmlspecialchars($img['name']); ?>">
            <button type="submit" class="btn btn-danger btn-sm" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </form>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <?php else: ?>
    <p style="color:var(--admin-text-light);">No images uploaded yet.</p>
    <?php endif; ?>
  </div>
</div>

<script>
// Upload zone click handler
document.getElementById('uploadZone').addEventListener('click', function() {
  document.getElementById('fileInput').click();
});

// File selection preview
document.getElementById('fileInput').addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file) return;
  
  var reader = new FileReader();
  reader.onload = function(ev) {
    document.getElementById('previewImg').src = ev.target.result;
    document.getElementById('previewName').textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
    document.getElementById('uploadPreview').style.display = 'block';
  };
  reader.readAsDataURL(file);
});

// Copy image path
function copyPath(path) {
  navigator.clipboard.writeText(path).then(function() {
    var btn = event.target.closest('button');
    var orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    setTimeout(function() { btn.innerHTML = orig; }, 1500);
  });
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
