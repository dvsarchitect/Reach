let currentCrew = '';
let currentShift = '';

// Set the current date in the header in the format "Month Day, Year"
function updateDateDisplay() {
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    const crewShiftDisplay = currentCrew === 'Day' ? 'Day Crew - ' : `${currentCrew} Crew ${currentShift} - `;
    document.getElementById('current-date').textContent = crewShiftDisplay + formattedDate;
}

function showSection(sectionId) {
    // Hide all sections and the default content
    document.querySelectorAll('.section, #default-content').forEach(function(section) {
        section.classList.remove('active');
        section.style.display = 'none'; // Ensure all sections and default content are hidden
    });

    // Show the selected section with a transition
    const selectedSection = document.getElementById(sectionId);
    selectedSection.style.display = 'block';
    setTimeout(function() {
        selectedSection.classList.add('active');
    }, 10); // Timeout for transition to take effect
}

function goToMain() {
    // Hide all sections
    document.querySelectorAll('.section').forEach(function(section) {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // Show the default content
    const defaultContent = document.getElementById('default-content');
    defaultContent.style.display = 'block';
    setTimeout(function() {
        defaultContent.classList.add('active');
    }, 10);
}

function saveData(section, inputId, attachmentId, preventFullscreenExit) {
    if (inputId) {
        const data = document.getElementById(inputId).value;
        localStorage.setItem(section + '-data', data);
    }

    // Handle attachments
    const attachments = document.getElementById(attachmentId).files;
    const attachmentData = JSON.parse(localStorage.getItem(section + '-attachments')) || [];

    for (let i = 0; i < attachments.length; i++) {
        const reader = new FileReader();
        reader.onload = function(event) {
            attachmentData.push({
                filename: attachments[i].name,
                content: event.target.result
            });
            localStorage.setItem(section + '-attachments', JSON.stringify(attachmentData));
            loadAttachmentList(section);
        };
        reader.readAsDataURL(attachments[i]);
    }

    updateButtonStatus(); // Update the button labels
    alert('Data and attachments saved for ' + section);

    // Prevent exiting fullscreen after save
    if (preventFullscreenExit) {
        if (document.fullscreenElement) {
            document.fullscreenElement.focus();
        }
    }
}

function loadAttachmentList(section) {
    const attachments = JSON.parse(localStorage.getItem(section + '-attachments')) || [];
    const attachmentList = document.getElementById(section + '-attachment-list');
    attachmentList.innerHTML = ''; // Clear the list

    if (attachments.length > 0) {
        attachments.forEach((attachment, index) => {
            const attachmentLink = document.createElement('a');
            attachmentLink.textContent = `Attachment ${index + 1}: ${attachment.filename}`;
            attachmentLink.onclick = function() { displayAttachment(section, index); };
            attachmentList.appendChild(attachmentLink);
            attachmentList.appendChild(document.createElement('br'));
        });
    } else {
        attachmentList.innerHTML = '<p>No attachments</p>';
    }
}

function displayAttachment(section, index = 0) {
    const attachments = JSON.parse(localStorage.getItem(section + '-attachments')) || [];

    if (attachments.length === 0) {
        alert('No attachments to display.');
        return;
    }

    const attachment = attachments[index];
    const modalIframe = document.getElementById('modal-iframe');
    modalIframe.src = attachment.content;

    // Display the modal
    const modal = document.getElementById('attachmentModal');
    modal.style.display = 'flex';

    // Update navigation
    updateModalNav(section, index);
}

function updateModalNav(section, index) {
    const attachments = JSON.parse(localStorage.getItem(section + '-attachments')) || [];
    const prevButton = document.getElementById('prev-attachment');
    const nextButton = document.getElementById('next-attachment');

    prevButton.disabled = index <= 0;
    nextButton.disabled = index >= attachments.length - 1;

    prevButton.onclick = function() { navigateAttachment(section, index - 1); };
    nextButton.onclick = function() { navigateAttachment(section, index + 1); };
}

function navigateAttachment(section, index) {
    displayAttachment(section, index);
}

function closeModal() {
    const modal = document.getElementById('attachmentModal');
    modal.style.display = 'none';
}

function saveFatalRisksData(preventFullscreenExit) {
    const data = [];
    for (let i = 1; i <= 2; i++) { // Adjusted to handle only two line items
        const name = document.getElementById(`name-${i}`).value;
        const task = document.getElementById(`task-${i}`).value;
        const risks = Array.from(document.getElementById(`risk-${i}`).selectedOptions).map(option => option.value);
        
        if (name || task || risks.length > 0) { // Check if any data is entered
            data.push({
                name: name,
                task: task,
                risks: risks
            });
        }
    }

    if (data.length > 0) {
        localStorage.setItem('fatal-risks-data', JSON.stringify(data));
        updateButtonStatus(); // Update the button labels
        alert('Fatal Risks data saved.');
    } else {
        alert('Please enter at least one line item.');
    }

    // Prevent exiting fullscreen after save
    if (preventFullscreenExit) {
        if (document.fullscreenElement) {
            document.fullscreenElement.focus();
        }
    }
}

function saveThreeWsData(preventFullscreenExit) {
    const data = [];
    for (let i = 1; i <= 5; i++) {
        const who = document.getElementById('who-' + i).value;
        const what = document.getElementById('what-' + i).value;
        const where = document.getElementById('where-' + i).value;

        if (who || what || where) {
            data.push(`${who} - ${what} - ${where}`);
        }
    }
    localStorage.setItem('three-ws-data', JSON.stringify(data));
    updateButtonStatus(); // Update the button labels
    alert('3 W\'s data saved.');

    // Prevent exiting fullscreen after save
    if (document.fullscreenElement) {
        document.fullscreenElement.focus();
    }
}

function exportData() {
    const sections = ['dna-share', 'safety', 'production', 'celebrate', 'site-comm', 'three-ws', 'safety-focus', 'fatal-risks'];
    let dataStr = '';

    sections.forEach(section => {
        const sectionData = localStorage.getItem(section + '-data') || 'No data';
        const attachments = JSON.parse(localStorage.getItem(section + '-attachments')) || [];
        
        dataStr += `\n--- ${section.toUpperCase().replace('-', ' ')} ---\n\n`;
        dataStr += `Data: ${sectionData}\n`;
        
        if (attachments.length > 0) {
            dataStr += `Attachments:\n`;
            attachments.forEach((attachment, index) => {
                dataStr += `  Attachment ${index + 1}: ${attachment.filename}\n`;
            });
        } else {
            dataStr += 'No attachments\n';
        }

        // Clear the attachments after exporting
        localStorage.removeItem(section + '-attachments');
    });

    // Get current date to append to the filename
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
    const fileName = `safety_meeting_${formattedDate}.txt`;

    // Create a Blob and download the file
    const blob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

function resetPage() {
    // Confirm if the user wants to reset the page
    if (confirm('Are you sure you want to reset the page? This will clear all entered data.')) {
        // Clear all local storage items
        localStorage.clear();

        // Clear all preview texts
        document.querySelectorAll('.section-button small').forEach(function(preview) {
            preview.textContent = '';
        });

        // Clear all inputs
        document.querySelectorAll('input[type="text"], textarea').forEach(function(input) {
            input.value = '';
        });

        // Clear all file inputs
        document.querySelectorAll('input[type="file"]').forEach(function(input) {
            input.value = '';
        });

        alert('Page has been reset.');
        goToMain(); // Return to the main page after reset
    }
}

function newPage() {
    resetPage(); // Reset the page data

    // Open the modal for crew and shift selection
    const modal = document.getElementById('crewShiftModal');
    modal.style.display = 'flex';
}

function confirmCrewShift() {
    const crew = document.getElementById('crewSelect').value;
    const shift = document.getElementById('shiftSelect').value;

    if (!crew) {
        alert('Please select a crew.');
        return;
    }

    if (crew !== 'Day' && !shift) {
        alert('Please select a shift.');
        return;
    }

    currentCrew = crew;
    currentShift = crew === 'Day' ? '' : shift;

    updateDateDisplay(); // Update the date display with the selected crew and shift
    closeCrewShiftModal(); // Close the modal after selection

    // Save a new page automatically after selecting crew and shift
    savePage();
}

function closeCrewShiftModal() {
    const modal = document.getElementById('crewShiftModal');
    modal.style.display = 'none';
}

function savePage() {
    const data = {
        crew: currentCrew,
        shift: currentShift,
        dnaShare: localStorage.getItem('dna-share-data') || '',
        safety: localStorage.getItem('safety-data') || '',
        production: localStorage.getItem('production-data') || '',
        celebrate: localStorage.getItem('celebrate-data') || '',
        siteComm: localStorage.getItem('site-comm-data') || '',
        threeWs: localStorage.getItem('three-ws-data') || [],
        safetyFocus: localStorage.getItem('safety-focus-data') || '',
        fatalRisks: JSON.parse(localStorage.getItem('fatal-risks-data')) || []
    };

    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
    const fileName = `${currentCrew}_${currentShift}_${formattedDate}.json`;

    const json = JSON.stringify(data, null, 2);

    // Create a Blob and save the JSON file
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    alert('Page data has been saved.');
}

function triggerFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = JSON.parse(event.target.result);
        currentCrew = data.crew || '';
        currentShift = data.shift || '';

        localStorage.setItem('dna-share-data', data.dnaShare || '');
        localStorage.setItem('safety-data', data.safety || '');
        localStorage.setItem('production-data', data.production || '');
        localStorage.setItem('celebrate-data', data.celebrate || '');
        localStorage.setItem('site-comm-data', data.siteComm || '');
        localStorage.setItem('three-ws-data', JSON.stringify(data.threeWs || []));
        localStorage.setItem('safety-focus-data', data.safetyFocus || '');
        localStorage.setItem('fatal-risks-data', JSON.stringify(data.fatalRisks || []));

        updateDateDisplay(); // Update the date display with the loaded crew and shift
        updateButtonStatus(); // Update the button labels with the loaded data
        alert('Saved page loaded successfully.');
    };
    reader.readAsText(file);
}

function updateButtonStatus() {
    // Update the small text below each button with the data from localStorage
    const sections = [
        { id: 'dna-share', input: 'dna-share-data' },
        { id: 'safety', input: 'safety-data' },
        { id: 'production', input: 'production-data' },
        { id: 'celebrate', input: 'celebrate-data' },
        { id: 'site-comm', input: 'site-comm-data' },
        { id: 'three-ws', input: 'three-ws-data' },
        { id: 'safety-focus', input: 'safety-focus-data' },
        { id: 'fatal-risks', input: 'fatal-risks-data' }
    ];

    sections.forEach(section => {
        const preview = document.getElementById(section.id + '-preview');
        let data = JSON.parse(localStorage.getItem(section.input)) || '';
        
        if (Array.isArray(data)) {
            // For three-ws and fatal-risks sections, show only the first few lines
            const displayData = data.slice(0, 3).join('\n');
            preview.textContent = displayData.length > 0 ? displayData + (data.length > 3 ? '...' : '') : '';
        } else {
            preview.textContent = data.length > 0 ? data.slice(0, 50) + (data.length > 50 ? '...' : '') : '';
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    updateDateDisplay(); // Initialize the date display
    updateButtonStatus(); // Update the button labels with the saved data

    // Ensure the modal stays hidden on page load
    const fatalRisksModal = document.getElementById("fatalRisksModal");
    fatalRisksModal.style.display = "none";

    // Attach event listener directly to the Fatal Risks image
    const fatalRisksImage = document.getElementById("fatal-risks-image");
    fatalRisksImage.addEventListener("click", function() {
        openFatalRisksSlideshow();
    });

    // Close the modal when the close button is clicked
    const closeModalButton = document.getElementById("close-fatal-risks-modal");
    closeModalButton.addEventListener("click", function() {
        closeFatalRisksSlideshow();
    });
});

let currentSlideIndex = 0;
let fatalRisksImages = [
    'file:///S:/AssayLab/LABTEC/LW-LIMS shared files/PreStart/images/fatal-risks/Blasting & Explosives.jpg',
    'file:///S:/AssayLab/LABTEC/LW-LIMS shared files/PreStart/images/fatal-risks/Confined Space.jpg',
    'file:///S:/AssayLab/LABTEC/LW-LIMS shared files/PreStart/images/fatal-risks/Fall of Ground.jpg',
    'file:///S:/AssayLab/LABTEC/LW-LIMS shared files/PreStart/images/fatal-risks/Falling from Heights.jpg',
    'file:///S:/AssayLab/LABTEC/LW-LIMS shared files/PreStart/images/fatal-risks/Fire.jpg',
    'file:///S:/AssayLab/LABTEC/LW-LIMS shared files/PreStart/images/fatal-risks/Hazardous Substances & Chemicals.jpg',
    'file:///S:/AssayLab/LABTEC/LW-LIMS shared files/PreStart/images/fatal-risks/Lifting.jpg',
    'file:///S:/AssayLab/LABTEC/LW-LIMS shared files/PreStart/images/fatal-risks/Mobile Equipment.jpg',
    'file:///S:/AssayLab/LABTEC/LW-LIMS shared files/PreStart/images/fatal-risks/Rotating Equipment.jpg',
    'file:///S:/AssayLab/LABTEC/LW-LIMS shared files/PreStart/images/fatal-risks/Stored Energy.jpg'
];

function openFatalRisksSlideshow() {
    const fatalRisksModal = document.getElementById("fatalRisksModal");
    const slideshowImage = document.getElementById("slideshow-image");

    // Only open the modal if images are present
    if (fatalRisksImages.length > 0) {
        currentSlideIndex = 0;
        slideshowImage.src = fatalRisksImages[currentSlideIndex];
        fatalRisksModal.style.display = "flex";
    } else {
        alert('No images found in the Fatal Risks folder.');
    }
}

function closeFatalRisksSlideshow() {
    const fatalRisksModal = document.getElementById("fatalRisksModal");
    fatalRisksModal.style.display = "none";
}

function navigateFatalRisksSlide(direction) {
    currentSlideIndex += direction;

    if (currentSlideIndex < 0) {
        currentSlideIndex = fatalRisksImages.length - 1;
    } else if (currentSlideIndex >= fatalRisksImages.length) {
        currentSlideIndex = 0;
    }

    const slideshowImage = document.getElementById("slideshow-image");
    slideshowImage.src = fatalRisksImages[currentSlideIndex];
}

function toggleFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Firefox
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE/Edge
            elem.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}
