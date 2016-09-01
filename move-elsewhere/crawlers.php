<?php
error_reporting(E_ALL);
ini_set('display_errors', 'On'); // or ini_set('display_errors', 1);

require 'crawler-helpers/autoload.php';
use Masterminds\HTML5;

$requestedPageName = 'index';
if(isset($_GET['p'])) {
  $requestedPageName = $_GET['p'];
  $requestedPageName = $requestedPageName == '' ? 'index' : $requestedPageName;
}

if(file_exists("./$requestedPageName.html")) {
  $pageName = $requestedPageName;
} else {
  header("HTTP/1.0 404 Not Found");
  $pageName = '404';
}

/************************/
/* Hide the placeholder */
/*************************/
echo "<style>#cms-less-content-placeholder{display:none !important;}</style>";

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

/**************************/
/*         Return         */
/**************************/
echo $completePage->saveHTML();

?>
