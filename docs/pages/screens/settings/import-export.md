# Import and Export

Here you can backup and restore your whirlpool database, either locally or via the cloud.

> [!WARNING]
> There are a few things that are not currently backed up via either these options, because they're not saved in the same way the rest of the app's data is. Pretty much everything in the General Settings page will need to be set up again on a different device/browser, even if you import your data.

## Local Import and Export

Local import/export allows you to manage your database data between devices using a JSON file. Press the Export button to download a JSON file containing your entire entire database. You can then bring this file to another device or browser and use the Import button to set up shop there.

> [!TIP]
> For the technically minded, the app uses IndexedDB for its database, which is a browser-based database storage solution. You can see what exactly will be backed up by opening up your browser's DevTools and navigation to the Application tab.

## Cloud Sync

Alternatively, for those who don't want to fuss with a local file, you can opt to back up your database to the cloud. This can be either a manual backup/restore process as with local import/export, or you can opt to have the app handle this automatically for you. Either way, as with local import/export, this feature is entirely optional.

The app's cloud sync works using a Sync Code. To start, you need to hit the Request Sync Code button, which will query the server to issue you a new code. Your Sync Code is used to identify your database.