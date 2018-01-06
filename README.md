This is a wordlist app, built with Ionic. It loads data from a Firebase database. It uses a web worker to load data because it was built for a dictionary with +25,000 entries and it was taking tooooo long without.

## Installation


### Install the code

Clone the code, cd into it and do `npm install`


### Set up a firebase account

You can use the configs provided with the project by:

- creating the poject's public www dir with `ionic build`,
- change into the functions dir and run `npm install`,
- change back up to the project dir and,
- then link the local project to firebase by running `firebase deploy`. 

Or, build the configs by scratch by:

Set permissions for firebase database read access in the firebase console `Database > Rules`

    {
      "rules": {
        ".read": "auth == null",
        ".write": "auth != null",
        "entries": {
          ".indexOn": ["initial"]
        }
      }
    }

For now, set the Storage rules to allow for public read access

    service firebase.storage {
      match /b/{bucket}/o {
        match /{allPaths=**} {
          allow write: if request.auth != null;
          allow read: if request.auth == null;
        }
      }
    }




Either way, do this after linking the project with firebase.

Set CORS by creating a `cors.json` file with the following

```
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

then run this from the project dir (replace the url with your bucket's url)

    gsutil cors set cors.json gs://your-bucket-url

If you want to check CORS in the browser, set a local proxy
https://blog.ionicframework.com/handling-cors-issues-in-ionic/




Copy the firebase config settings from `Overview > Add Firebase to your web app` to the `/src/assets/js/firebase-worker.js` and `/src/app/app.module.ts` We need: 

- apiKey
- authDomain
- databaseURL
- storageBucket
- messagingSenderId

Create two folders in the Console > Storage for `audio` and `image`

Set the storage rules to allow unauth read

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



### Set your languages

Set your language codes in `/src/providers/language-service.ts`

 

-----

# Things to do 

provide sample json data

test without firebase worker

add attachment methods (save files and play)


-----

Kamuthant is a Kayardild word for 'a person who has a lot of words, who talks a lot'. 
