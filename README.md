# SVKM NMIMS Dhule Voice Assistant

This project is a local voice assistant prototype for SVKM NMIMS Global University, Dhule. It keeps the existing verified knowledge-base and AI response logic while presenting the experience as a realistic mobile call simulator in the browser.

## Run the browser call simulator locally

From the project root:

```powershell
cd D:\voice
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/web/index.html
```

The browser will show a phone-call style interface with a simulated call flow, microphone input, and voice response.

## Deploy to GitHub Pages

This site is static and can be deployed from GitHub Pages without changing the AI logic.

1. Push the repository to GitHub.
2. In GitHub, open the repository settings.
3. Go to Pages.
4. Select the branch and folder:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/web`
5. Save.

Your app will be available at:

```text
https://<your-username>.github.io/<your-repository>/web/index.html
```

If you prefer a cleaner root URL, you can also copy the static files from `web/` to the root of the Pages branch.

## Run the Android app

Open the project in Android Studio, then run the `app` configuration on an emulator or device.

```powershell
cd D:\voice
.\gradlew.bat :app:assembleDebug
```

The APK is generated in:

```text
app/build/outputs/apk/debug/app-debug.apk
```

## Test the project

```powershell
cd D:\voice
.\gradlew.bat :app:testDebugUnitTest
```

## Browser call-flow behavior

- The browser starts in a realistic smartphone UI.
- Clicking the call button begins a calling animation and then connects the simulated line.
- The assistant prompts for language preference first: English, Hindi, or Marathi.
- After the spoken language is detected, the assistant switches to that language and delivers the official Dhule introduction and verified academic information.
- User questions are handled by the existing local AI and knowledge-base logic.
- Admission-related or missing information triggers the simulated transfer flow.
- There is no normal chatbot interface, no message bubbles, and no primary text-chat experience.

## Knowledge-base and AI reuse

The current implementation reuses the existing:

- browser speech recognition
- speech synthesis
- local language logic
- local AI response boundary
- verified knowledge base in `knowledge_base/`

The browser front-end is redesigned to feel like a phone call without replacing the core backend rules.

## Verified source

The assistant only answers information available in the verified NMIMS Dhule knowledge base and official homepage content.

If a fact is not present or requires admission-specific details, it escalates to the Admission Department simulation rather than guessing.

## Notes

This prototype does not place a real phone call and does not require telephony permissions.

