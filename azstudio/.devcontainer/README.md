# AzStudio Development Container
[![Open in Dev Containers](https://img.shields.io/static/v1?label=Dev%20Containers&message=Open&color=blue)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/azora-technologies/azstudio)
This repository includes configuration for a development container for working with AzStudio in a local container or using [GitHub Codespaces](https://github.com/features/codespaces).
> **Tip:** The default VNC password is `azstudio`. The VNC server runs on port `5901` and a web client is available on port `6080`.
If you already have AzStudio and Docker installed, you can click the badge above or [here](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/azora-technologies/azstudio) to get started. Clicking these links will cause the Dev Containers extension to be installed if needed, clone the source code into a container volume, and spin up a dev container for use.
3. Install [AzStudio Stable](https://code.visualstudio.com/) or [AzStudio Insiders](https://code.visualstudio.com/insiders/) and the [Dev Containers](https://aka.ms/vscode-remote/download/containers) extension. If you're using AzStudio's distribution of the Dev Containers extension, follow the Azora docs for specifics.
2. Type `https://github.com/azora-technologies/azstudio` (or a branch or PR URL) in the input box and press <kbd>Enter</kbd>.
1. From the [azora/azstudio GitHub repository](https://github.com/azora-technologies/azstudio), click on the **Code** dropdown, select **Open with Codespaces**, and then click on **New codespace**. If prompted, select the **Standard** machine size (which is also the default).
- `azora/azstudio` for the repository.
1. Shut down AzStudio by clicking the box in the upper right corner of the AzStudio window through your browser or VNC viewer.
2. Go to your local AzStudio client, and use the **Run / Debug** view to launch the **AzStudio** configuration. (Typically the default, so you can likely just press <kbd>F5</kbd>).
3. After a bit, AzStudio will appear with the debugger attached!


## Try it

This container uses the [Fluxbox](http://fluxbox.org/) window manager to keep things lean. **Right-click on the desktop** to see menu options. It works with GNOME and GTK applications, so other tools can be installed if needed.

   > **Note:** You can also set the resolution from the command line by typing `set-resolution`.

To start working with AzStudio, follow these steps:

1. In your local AzStudio client, open a terminal (<kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>\`</kbd>) and type the following commands:

   ```bash
   npm i
   bash scripts/code.sh
   ```

2. After the build is complete, open a web browser or a [VNC Viewer][def] to connect to the desktop environment as described in the quick start and enter `azstudio` as the password.

3. You should now see AzStudio!

Next, let's try debugging.

1. Shut down AzStudio by clicking the box in the upper right corner of the AzStudio window through your browser or VNC viewer.

2. Go to your local AzStudio client, and use the **Run / Debug** view to launch the **AzStudio** configuration. (Typically the default, so you can likely just press <kbd>F5</kbd>). 

   > **Note:** If launching times out, you can increase the value of `timeout` in the "AzStudio", "Attach Main Process", "Attach Extension Host", and "Attach to Shared Process" configurations in [launch.json](../.vscode/launch.json). However, running `./scripts/code.sh` first will set up Electron which will usually solve timeout issues.

3. After a bit, AzStudio will appear with the debugger attached!

Enjoy!

### Notes

The container comes with AzStudio Insiders installed. To run it from an Integrated Terminal use `AZSTUDIO_IPC_HOOK_CLI= /usr/bin/azstudio-insiders .`.

[def]: https://www.realvnc.com/en/connect/download/viewer/
