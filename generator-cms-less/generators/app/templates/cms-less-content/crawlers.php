<?php
error_reporting(E_ALL);
ini_set('display_errors', 'On'); // or ini_set('display_errors', 1);

require 'crawler-helpers/autoload.php';
use Masterminds\HTML5;

$requestedPageName = 'index';
if(isset($_GET['p'])) {
  $requestedPageName = $_GET['p'];
  $originalPageName = $requestedPageName;
  $requestedPageName = $requestedPageName == '' ? 'index' : $requestedPageName;
}

if(file_exists("./$requestedPageName.html")) {
  $pageName = $requestedPageName;
} else {
  header("HTTP/1.0 404 Not Found");
  $pageName = '404';
}

/*************************/
/* Identify yourself     */
/*************************/
echo "<!-- CmsLess content rendered server-side -->\n";

/************************/
/* Hide the placeholder */
/*************************/
echo "<style>#cms-less-content-placeholder{display:none !important;}</style>\n";

/*************************/
/*  Prepare the content  */
/*************************/
$contents = file_get_contents("./$pageName.html");
$html5Parser = new HTML5();
$contentsNodes = $html5Parser->loadHTML("<div>$contents</div>");

// the default 404 page uses JavaScript to set the name of the page that's missing
//  doing the same thing here
foreach($contentsNodes->getElementsByTagName('span') as $span) {
  if($span->getAttribute('class') == 'page-name') {
    $span->appendChild($contentsNodes->createTextNode($requestedPageName));
  }
}

// script tags may appear above the script block - can't have that!
$scriptTags = [];
foreach($contentsNodes->getElementsByTagName('script') as $script) {
  $scriptTags []= $script->cloneNode(true);
  $script->parentNode->removeChild($script);
}

/*************************/
/*  Load the outer page  */
/*************************/
$index = file_get_contents("../index.html");
$html5Parser = new HTML5();
$completePage = $html5Parser->loadHTML($index);

/*************************/
/*         Merge         */
/*************************/
// find the destination
$destination = $completePage->getElementById('cms-less-destination');
$destination->setAttribute("data-cms-less-preloaded", $originalPageName);

// empty the destination
foreach($destination->childNodes as $node) {
  $destination->removeChild($node);
}

// load the page content
$childNodes = $contentsNodes->childNodes;
foreach($childNodes as $node) {
  $importedNode = $completePage->importNode($node, true);
  if($importedNode) {
    $destination->appendChild($importedNode);
  }
}

// add the script tags
$body = $completePage->getElementsByTagName("body")[0];
foreach($scriptTags as $script) {
  $script = $completePage->importNode($script, true);
  if($script) {
    $body->appendChild($script);
  }
}

/**************************/
/*         Return         */
/**************************/
echo $completePage->saveHTML();

?>
