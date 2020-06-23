"use strict";

const tryMeButton                    = document.getElementById("tryMeButton");
const codeArea                       = document.getElementById("codeArea");
const WAIT_TIME                      = 50; // 50 milliseconds
const ALLOWED_EXTENSION              = ["py", "rb", "js", "c", "sh", "go", "java", ];

/*
linePrintedLog in a global variable shared by functions which is used to keep track of the lines in the code which have been printed. This is essential as this helps us synchronize the whole 'wrting out code effect'.
*/
let linePrintedLog = [];

function markLinePrintedInLogWhenItsPreviousLineIsDone(lineNumber) {
  let previousDone = linePrintedLog[lineNumber - 1];
  if(previousDone) {
    linePrintedLog[lineNumber] = true;
  } else {
    setTimeout(() => markLinePrintedInLogWhenItsPreviousLineIsDone(lineNumber), WAIT_TIME);
  }
}

async function getCodeFromRepositoryAndTypeIt(username, repositoryName) {
  let url       = `https://api.github.com/repos/${repositoryName}/git/trees/master?recursive=2`;
  let response  = await fetch(url);
  let result    = await response.json();

  let filesInRepository = result.tree;
  let codeFiles = filesInRepository.filter(file => {
    let fileExtension = file.path.split(".").slice(-1)[0];
    return ALLOWED_EXTENSION.includes(fileExtension);
  });

  if(codeFiles.length === 0) {
    alert(`${repositoryName} has no code files of such extension`);
    window.location.reload();
    return;
  }

  let randomlySelectedFile = codeFiles[Math.floor(Math.random() * codeFiles.length)];
  let filename = randomlySelectedFile.path;

  url = `https://api.github.com/repos/${repositoryName}/contents/${filename}`;
  response = await fetch(url);
  result = await response.json();
  // content is base64 encoded and we need to decode it into string.
  let resultStr  = atob(result.content);

  let lineNumber = 0;
  let codeLines  = resultStr.split("\n");

  // We are populating the synchronization array with undefined(just to get easy falsy values).
  // so that we can maintain synchronization.
  linePrintedLog.length = codeLines.length;

  // Hide the button and let the show happen
  tryMeButton.style.display = "none";

  codeLines.forEach(codeLine => {
    let codeLineDiv = document.createElement("div");
    let codeLineP   = document.createElement('p');
    let code        = codeLine.replace(/ /g, '\u00a0').replace(/\t/g, '\u00a0\u00a0');
    typeCode(code, codeLineP, lineNumber);lineNumber++;
    codeLineDiv.appendChild(codeLineP);
    codeArea.appendChild(codeLineDiv);
  });
}

async function getARandomRepoAndTypeItsContents(username) {
  const url      = `https://api.github.com/search/repositories?q=user:${username}`;
  const response = await fetch(url);
  const result   = await response.json();
  let repos      = [];
  result.items.forEach(i => {
    repos.push(i.full_name);
  });

  // Picking a random repo out of all public repos
  let repositoryName = repos[Math.floor(Math.random() * repos.length)];
  getCodeFromRepositoryAndTypeIt(username, repositoryName);
}

// Index in the function defination is used as a marker of where we are in the code writing process and it set of zero till its the lines turn to start writing and after that maintains position.
function typeCode(txt, element, lineNumber, index = 0) {
  // The first line need no waiting.
  // Else for each line, Wait for previous line to complete printing.
  if(lineNumber !== 0 && !linePrintedLog[lineNumber-1]) {
    setTimeout(() => typeCode(txt, element, lineNumber), WAIT_TIME);
    return;
  }

  // If line has text to be printed, print that. Else mark the line completed in log.
  if(index < txt.length) {
    element.innerHTML += txt.charAt(index);
    index++;
    setTimeout(() => typeCode(txt, element, lineNumber, index), WAIT_TIME);
  } else {
    linePrintedLog[lineNumber] = true;
  }
}

function main() {
  let githubUsername = prompt('What is your github username', '');
  tryMeButton.innerHTML = "Please Wait while we are getting hands on some random code from your github repository";
  if(githubUsername) {
    getARandomRepoAndTypeItsContents(githubUsername);
  } else {
    alert("Can work without you telling us your username");
  }
}

tryMeButton.addEventListener("click", main);
