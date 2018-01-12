This is a wordlist app, built with Ionic. It loads data from a Firebase database.

Kamuthant is a Kayardild word for 'a person who has a lot of words, who talks a lot'. 

-----

## Installation


### Install the code

Clone the code, cd into it and do `npm install`.

Run `ionic serve` to preview the app in a browser. You'll probably get errors until the firebase account is linked.


### Set up a firebase account

Copy the firebase config values from the Firebase console's `Overview > Add Firebase to your web app` page into the project's `/src/app/app.module.ts` file. We need: 

- apiKey
- authDomain
- databaseURL
- storageBucket
- messagingSenderId

Create two folders in firebase Console > Storage for `audio` and `image` and upload assets.

Check that the storage rules are set to allow unauthorised read:

```
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow write: if request.auth != null;
      allow read: if request.auth == null;
    }
  }
}
```

Upload json data to the database.


### Link the project with the Firebase account 

You can use the config files provided with the project (make sure you have done `ionic serve` or `ionic build` first to create the project's public www directory):

- install firebase tools `npm install -g firebase-tools`
- change into the functions dir and run `npm install`,
- change back up to the project dir
- then link the local project to firebase by running `firebase deploy`. 

set cross-origin headers for firebase storage files by running this from the project dir (replace the url with your bucket's url)

    gsutil cors set cors.json gs://your-bucket-url



### Set your languages

Set your language codes and language names in `/src/providers/language-service.ts`



### Deploy 

To deploy, first set up the apps in the app/play store accounts. 

Build cordova apps by running `ionic cordova platform add ios` and `ionic cordova platform add android`

Open the ios project at `platforms/ios/kamuthant.xcodeproj` in Xcode. Select your team in the General > Signing settings. In Build Settings, filter the options by 'code signing' and change the Code Signing Identity to 'iOS Developer'. Run on your deviec to test, then build an archive and upload it. 

Create a certificate for the Android app (replace PROJECT-NAME, and answer the questions...)

    keytool -genkey -v -keystore PROJECT-NAME.jks -keyalg RSA -keysize 2048 -validity 10000 -alias PROJECT-NAME

Then build the apk by `ionic cordova build android --prod --release`. Upload the apk to the play store.


