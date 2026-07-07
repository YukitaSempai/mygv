<?php
require_once __DIR__ . '/includes/functions.php';
requireLogin();

$pages = getPageList();
$sectionsDir = __DIR__ . '/../sections';
$sectionFiles = [];

if (is_dir($sectionsDir)) {
  $files = scandir($sectionsDir);
  foreach ($files as $f) {
    if (pathinfo($f, PATHINFO_EXTENSION) === 'html') {
      $sectionFiles[] = $f;
    }
  }
  sort($sectionFiles);
}

$message = '';

// Handle save section
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_section'])) {
  $filename = $_POST['filename'] ?? '';
  $content = $_POST['content'] ?? '';
  
  if ($filename && preg_match('/^[a-zA-Z0-9\-]+\.html$/', $filename)) {
    $filepath = $sectionsDir . '/' . $filename;
    file_put_contents($filepath, $content);
    $message = 'Section "' . htmlspecialchars($filename) . '" saved successfully!';
  }
}

// Get current section content
$currentFile = $_GET['file'] ?? ($sectionFiles[0] ?? '');
$currentContent = '';
if ($currentFile && in_array($currentFile, $sectionFiles)) {
  $currentContent = file_get_contents($sectionsDir . '/' . $currentFile);
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="section-header">
  <h1><i class="fa-solid fa-pen-to-square"></i> Edit Sections</h1>
</div>

<?php if ($message): ?>
<div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div>
<?php endif; ?>

<div style="display:flex; gap:1.5rem; align-items:flex-start; flex-wrap:wrap;">
  <!-- Section list (sidebar) -->
  <div class="admin-card" style="min-width:220px; flex-shrink:0;">
    <div class="admin-card-header">Sections</div>
    <div class="admin-card-body" style="padding:0;">
      <div style="display:flex; flex-direction:column;">
        <?php foreach ($sectionFiles as $sf): 
          $label = ucfirst(str_replace(['.html', '-'], ['', ' '], $sf));
        ?>
        <a href="?file=<?php echo urlencode($sf); ?>" 
           style="padding:0.65rem 1rem; text-decoration:none; color:<?php echo $currentFile === $sf ? 'var(--admin-accent)' : 'var(--admin-text)'; ?>; 
                  border-left:3px solid <?php echo $currentFile === $sf ? 'var(--admin-accent)' : 'transparent'; ?>; 
                  background:<?php echo $currentFile === $sf ? 'rgba(201,169,110,0.08)' : 'transparent'; ?>;
                  font-size:0.88rem; transition:all 0.2s;">
          <?php echo htmlspecialchars($label); ?>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
  
  <!-- Editor -->
  <div class="admin-card" style="flex:1; min-width:300px;">
    <div class="admin-card-header">
      Editing: <strong><?php echo htmlspecialchars($currentFile); ?></strong>
    </div>
    <div class="admin-card-body">
      <form method="post" onsubmit="return confirm('Save changes to this section?');">
        <input type="hidden" name="filename" value="<?php echo htmlspecialchars($currentFile); ?>">
        <div class="form-group">
          <textarea name="content" style="min-height:500px; font-family:'Courier New', monospace; font-size:0.82rem; line-height:1.5; tab-size:2;" 
                    spellcheck="false"><?php echo htmlspecialchars($currentContent); ?></textarea>
        </div>
        <div style="display:flex; gap:0.75rem; align-items:center;">
          <button type="submit" name="save_section" class="btn btn-primary">
            <i class="fa-solid fa-floppy-disk"></i> Save Section
          </button>
          <span style="color:var(--admin-text-light); font-size:0.8rem;">
            <i class="fa-solid fa-info-circle"></i> Changes take effect immediately on the live site.
          </span>
        </div>
      </form>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
