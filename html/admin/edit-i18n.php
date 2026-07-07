<?php
require_once __DIR__ . '/includes/functions.php';
requireLogin();

$dataFile = getDataPath('i18n.json');
$i18nData = json_decode(file_get_contents($dataFile), true);
if (!$i18nData) {
  $i18nData = [];
}

$languages = ['en' => 'English', 'fr' => 'Français', 'es' => 'Español'];
$message = '';

// Handle save
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_i18n'])) {
  $lang = $_POST['lang'] ?? 'en';
  $keys = $_POST['keys'] ?? [];
  $values = $_POST['values'] ?? [];
  
  if (!isset($i18nData[$lang])) {
    $i18nData[$lang] = [];
  }
  
  foreach ($keys as $i => $key) {
    $key = trim($key);
    if ($key === '') continue;
    $val = $values[$i] ?? '';
    $i18nData[$lang][$key] = $val;
  }
  
  file_put_contents($dataFile, json_encode($i18nData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
  $message = 'Translations saved successfully!';
  
  // Also update the i18n.js file
  updateI18nJs($i18nData);
}

// Handle delete key
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_key'])) {
  $lang = $_POST['lang'] ?? 'en';
  $key = $_POST['delete_key'] ?? '';
  
  if (isset($i18nData[$lang][$key])) {
    unset($i18nData[$lang][$key]);
    file_put_contents($dataFile, json_encode($i18nData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    updateI18nJs($i18nData);
    $message = 'Key deleted successfully!';
  }
}

// Handle add new key
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_key'])) {
  $newKey = trim($_POST['new_key'] ?? '');
  if ($newKey !== '') {
    foreach ($languages as $code => $name) {
      if (!isset($i18nData[$code])) $i18nData[$code] = [];
      if (!isset($i18nData[$code][$newKey])) {
        $i18nData[$code][$newKey] = '';
      }
    }
    file_put_contents($dataFile, json_encode($i18nData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    updateI18nJs($i18nData);
    $message = 'New key added!';
  }
}

// Sync from i18n.js if JSON is empty
if (empty($i18nData) || !isset($i18nData['en'])) {
  syncFromI18nJs($i18nData);
}

$selectedLang = $_GET['lang'] ?? 'en';
$currentKeys = $i18nData[$selectedLang] ?? [];

function updateI18nJs($data) {
  $jsPath = __DIR__ . '/../js/i18n.js';
  $parts = [];
  foreach ($data as $lang => $keys) {
    $lines = [];
    foreach ($keys as $key => $val) {
      $escapedVal = str_replace(["\\", "'", "\n", "\r"], ["\\\\", "\\'", "\\n", ""], $val);
      $lines[] = "    '$key': '$escapedVal'";
    }
    $parts[] = "  $lang: {\n" . implode(",\n", $lines) . "\n  }";
  }
  $content = "const i18n = {\n" . implode(",\n", $parts) . "\n};\n";
  file_put_contents($jsPath, $content);
}

function syncFromI18nJs(&$data) {
  $jsPath = __DIR__ . '/../js/i18n.js';
  if (!file_exists($jsPath)) return;
  $content = file_get_contents($jsPath);
  
  // Extract the object using regex
  if (preg_match('/const i18n\s*=\s*(\{.+?\});/s', $content, $matches)) {
    $jsonStr = $matches[1];
    // Convert JS object to JSON (add quotes to keys)
    $jsonStr = preg_replace('/(\w+)\s*:/', '"$1":', $jsonStr);
    $jsonStr = preg_replace("/'([^']*)'/", '"$1"', $jsonStr);
    $jsonStr = preg_replace("/,\s*\}/", "}", $jsonStr);
    $jsonStr = preg_replace("/,\s*\]/", "]", $jsonStr);
    
    $parsed = json_decode($jsonStr, true);
    if ($parsed) {
      $data = $parsed;
      file_put_contents(getDataPath('i18n.json'), json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
  }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="section-header">
  <h1><i class="fa-solid fa-language"></i> Edit Translations</h1>
  <button class="btn btn-primary" onclick="document.getElementById('addKeyForm').style.display='block'">
    <i class="fa-solid fa-plus"></i> Add Key
  </button>
</div>

<?php if ($message): ?>
<div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div>
<?php endif; ?>

<!-- Language tabs -->
<div class="lang-tabs">
  <?php foreach ($languages as $code => $name): ?>
  <a href="?lang=<?php echo $code; ?>" class="lang-tab <?php echo $selectedLang === $code ? 'active' : ''; ?>">
    <?php echo htmlspecialchars($name); ?>
  </a>
  <?php endforeach; ?>
</div>

<!-- Add Key Form -->
<div id="addKeyForm" style="display:none; margin-bottom:1.5rem;">
  <form method="post" class="admin-card">
    <div class="admin-card-body">
      <div class="form-group">
        <label for="new_key">New Translation Key</label>
        <input type="text" id="new_key" name="new_key" placeholder="e.g. my_new_key" required>
      </div>
      <button type="submit" name="add_key" class="btn btn-primary">
        <i class="fa-solid fa-plus"></i> Add Key to All Languages
      </button>
      <button type="button" class="btn btn-secondary" onclick="this.closest('form').style.display='none'">Cancel</button>
    </div>
  </form>
</div>

<!-- Edit form -->
<form method="post">
  <input type="hidden" name="lang" value="<?php echo $selectedLang; ?>">
  
  <div class="admin-card">
    <div class="admin-card-header">
      Editing: <strong><?php echo $languages[$selectedLang]; ?></strong>
      <span style="color:var(--admin-text-light);font-weight:400;margin-left:0.5rem;">
        (<?php echo count($currentKeys); ?> keys)
      </span>
    </div>
    <div class="admin-card-body">
      <?php if (count($currentKeys) > 0): ?>
      <table>
        <thead>
          <tr>
            <th style="width:250px;">Key</th>
            <th>Value</th>
            <th style="width:80px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php 
          // Merge all keys from all languages for consistency
          $allKeys = [];
          foreach ($i18nData as $langKeys) {
            foreach ($langKeys as $k => $v) {
              $allKeys[$k] = true;
            }
          }
          ksort($allKeys);
          
          // Show keys with values for current language, showing empty if not set
          foreach ($allKeys as $key => $_): 
            $val = $i18nData[$selectedLang][$key] ?? '';
          ?>
          <tr>
            <td><code style="font-size:0.78rem;"><?php echo htmlspecialchars($key); ?></code></td>
            <td>
              <input type="hidden" name="keys[]" value="<?php echo htmlspecialchars($key); ?>">
              <input type="text" name="values[]" value="<?php echo htmlspecialchars($val); ?>" 
                     style="width:100%; padding:0.4rem 0.6rem; border:1px solid var(--admin-border); border-radius:6px; font-size:0.85rem;">
            </td>
            <td>
              <form method="post" style="display:inline;" onsubmit="return confirm('Delete this key from all languages?');">
                <input type="hidden" name="lang" value="<?php echo $selectedLang; ?>">
                <input type="hidden" name="delete_key" value="<?php echo htmlspecialchars($key); ?>">
                <button type="submit" class="btn btn-danger btn-sm" title="Delete">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </form>
            </td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
      <?php else: ?>
      <p style="color:var(--admin-text-light);">No translations found. Click "Add Key" to get started.</p>
      <?php endif; ?>
    </div>
  </div>
  
  <?php if (count($currentKeys) > 0): ?>
  <div style="text-align:right; margin-top:1rem;">
    <button type="submit" name="save_i18n" class="btn btn-primary">
      <i class="fa-solid fa-floppy-disk"></i> Save Changes
    </button>
  </div>
  <?php endif; ?>
</form>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
