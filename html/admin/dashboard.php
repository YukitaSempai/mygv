<?php
require_once __DIR__ . '/includes/functions.php';
requireLogin();

// Count pages, images, translations
$pages = getPageList();
$images = getImageList();
$i18nData = json_decode(file_get_contents(getDataPath('i18n.json')), true);
$translationCount = 0;
$langCount = 0;
if ($i18nData) {
  $langCount = count($i18nData);
  foreach ($i18nData as $lang => $keys) {
    $translationCount = max($translationCount, count($keys));
  }
}

require_once __DIR__ . '/includes/header.php';
?>
<h1>Dashboard</h1>

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-icon"><i class="fa-solid fa-file-lines"></i></div>
    <div class="stat-value"><?php echo count($pages); ?></div>
    <div class="stat-label">Pages</div>
  </div>
  <div class="stat-card">
    <div class="stat-icon"><i class="fa-solid fa-language"></i></div>
    <div class="stat-value"><?php echo $langCount; ?></div>
    <div class="stat-label">Languages</div>
  </div>
  <div class="stat-card">
    <div class="stat-icon"><i class="fa-solid fa-message"></i></div>
    <div class="stat-value"><?php echo $translationCount; ?></div>
    <div class="stat-label">Translations per language</div>
  </div>
  <div class="stat-card">
    <div class="stat-icon"><i class="fa-solid fa-image"></i></div>
    <div class="stat-value"><?php echo count($images); ?></div>
    <div class="stat-label">Images</div>
  </div>
</div>

<div class="admin-card">
  <div class="admin-card-header">
    <i class="fa-solid fa-bolt"></i> Quick Actions
  </div>
  <div class="admin-card-body" style="display:flex; gap:0.75rem; flex-wrap:wrap;">
    <a href="edit-i18n.php" class="btn btn-primary">
      <i class="fa-solid fa-language"></i> Edit Translations
    </a>
    <a href="edit-sections.php" class="btn btn-primary">
      <i class="fa-solid fa-pen-to-square"></i> Edit Content
    </a>
    <a href="images.php" class="btn btn-primary">
      <i class="fa-solid fa-image"></i> Manage Images
    </a>
  </div>
</div>

<div class="admin-card">
  <div class="admin-card-header">
    <i class="fa-solid fa-clock"></i> Recently Modified Images
  </div>
  <div class="admin-card-body">
    <?php if (count($images) > 0): ?>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Size</th>
          <th>Last Modified</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach (array_slice($images, 0, 5) as $img): ?>
        <tr>
          <td><a href="../<?php echo $img['path']; ?>" target="_blank"><?php echo htmlspecialchars($img['name']); ?></a></td>
          <td><?php echo formatBytes($img['size']); ?></td>
          <td><?php echo date('M j, Y g:i a', $img['modified']); ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
    <?php else: ?>
    <p style="color:var(--admin-text-light);">No images found.</p>
    <?php endif; ?>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
