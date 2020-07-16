import MpgItem, { MpgItemData } from "./MpgItem";
import * as firebase from "firebase/app";
import "firebase/app";
import "firebase/firebase-firestore";
import "firebase/auth";
import "firebase/storage";
import MpgUser, { MpgUserData } from "./MpgUser";

export enum MessageType {
  Information = "Information",
  Error = "Error",
}

export default class MpgGraph {
  private items = new Map<string, MpgItem>();
  private refreshData: Function;
  private auth: firebase.auth.Auth | null = null;
  private db: firebase.firestore.Firestore | null = null;
  private authUser: firebase.User | null = null;
  private user: MpgUser | null;
  private initialLoadInProgress = true;
  private itemCollectionName = "items";
  private userCollectionName = "users";
  private itemsLoaded = 0;

  constructor(refreshData: Function, user: MpgUser | null) {
    this.refreshData = refreshData;
    this.user = user;
  }

  public createNewItem = async (headline: string) => {
    try {
      const item = new MpgItem("", headline);
      await this.storeItem(item);
      this.items.set(item.id, item);
      await this.invokeRefreshData();
      return item.id;
    } catch (error) {
      throw error;
    }
  };

  updateItem = async(item: MpgItem)=>{
    await this.storeItem(item)
  }

  private storeItem = async (item: MpgItem) => {
    try {
      const itemData = item.getItemData();
      if (this.db !== null) {
        if (this.authUser !== null) {
          if (this.authUser !== null) {
            if (this.authUser.uid !== null) {
              await this.db
                .collection(this.userCollectionName)
                .doc(this.authUser.uid)
                .collection(this.itemCollectionName)
                .doc(item.id)
                .set(itemData);
            } else {
              throw new Error("createNewItem: user uid is null");
            }
          } else {
            throw new Error("createNewItem: auth user is null");
          }
        } else {
          throw new Error("createNewItem: db is null");
        }
      }
    } catch (error) {
      throw error;
    }
  };

  private invokeRefreshData = async () => {
    await this.refreshData(
      this.items,
      this.user,
      this.initialLoadInProgress,
      this.itemsLoaded
    );
  };

  getMatchedItems = (searchText: string): Map<string, MpgItem> => {
    const foundItems = new Map<string, MpgItem>();
    this.items.forEach((item) => {
      if (
        (item.headline.toLowerCase() + item.notes.toLowerCase()).includes(
          searchText.toLowerCase()
        )
      ) {
        foundItems.set(item.id, item);
      }
    });
    return foundItems;
  };

  public initialise = async () => {
    this.initFirebase();
    this.invokeRefreshData();
  };

  signinUser = async () => {
    if (this.auth !== null) {
      const provider = new firebase.auth.GoogleAuthProvider();
      await this.auth.signInWithPopup(provider);
    } else {
      throw new Error(
        "MpgGraphData: signinUser: Signing in. Cannot signin: auth is null"
      );
    }
  };

  private initFirebase = async () => {
    try {
      const firebaseConfig = {
        apiKey: "AIzaSyBd1tljJyCuzP_4D2U1lXD-s7CsTZWhbfc",
        authDomain: "mygraph38.firebaseapp.com",
        databaseURL: "https://mygraph38.firebaseio.com",
        projectId: "mygraph38",
        storageBucket: "mygraph38.appspot.com",
        messagingSenderId: "751066007220",
        appId: "1:751066007220:web:71ed88e513293fb38eb9e1",
      };
      firebase.initializeApp(firebaseConfig);
      // this enable local persistence
      // need to invistigate how does it work and how to verify that it's working
      await firebase.firestore().enablePersistence();
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      if (this.auth !== null) {
        this.auth.onAuthStateChanged((authUser) => {
          authUser
            ? this.initUserAndLoadData(authUser)
            : (this.authUser = null);
          this.invokeRefreshData();
        });
      } else {
        throw new Error(
          "MpgGraphData: initFirebase: Cannot set listener on auth. auth is null"
        );
      }
    } catch (error) {
      throw new Error(
        `MyGraph: error initialising firebase: details: ${error}`
      );
    }
  };

  initUserAndLoadData = async (authUser: firebase.User) => {
    this.authUser = authUser;
    await this.checkUserAndCreateIfNew();
    await this.invokeRefreshData();
  };

  private checkUserAndCreateIfNew = async () => {
    try {
      if (await this.doesUserExist()) {
        // user already exist
        await this.loadUserDoc();
        if (this.user !== null) {
          this.user.userSignedOn = true;
          // update user data with new date
          this.user.updatedAt = new Date();
          await this.updateUserDoc(this.user);
          await this.loadData();
        } else {
          throw new Error(
            `MpgGraphData: checkUserAndCreateIfNew: this.user is null`
          );
        }
      } else {
        // new user
        if (this.authUser !== null) {
          let userName = "Unknow";
          if (this.authUser.displayName !== null) {
            userName = this.authUser.displayName.split(" ")[0];
            if (this.authUser !== null) {
              if (this.authUser.uid !== null) {
                this.user = new MpgUser(this.authUser.uid, userName);
                this.user.userSignedOn = true;
                await this.updateUserDoc(this.user);
              }
            }
          }
        } else {
          throw new Error(
            `MpgGraphData: checkUserAndCreateIfNew: this.authuser is null`
          );
        }
      }
      // console.log("settingListners")
      await this.setListnerOnCollections();
      // this.endInitialLoadInProgress()
      // let update loadcal items finish!
      // I really don't know why this seems to comeback before the loading is finish
      // invistigate later
      setTimeout(this.endInitialLoadInProgress, 2000);
      await this.invokeRefreshData();
    } catch (error) {
      throw error;
    }
  };

  private endInitialLoadInProgress = () => {
    this.initialLoadInProgress = false;
    this.invokeRefreshData();
  };

  private setListnerOnCollections = async () => {};

  private loadData = async () => {
    await this.loadItems()
  };

  private loadItems = async () => {
    try {
      if (this.db !== null) {
        if (this.authUser !== null) {
          if (this.authUser.uid !== null) {
            const docRef = await this.db
              .collection("users")
              .doc(this.authUser.uid)
              .collection(this.itemCollectionName)
              .get();
            if (docRef !== undefined) {
              docRef.docs.forEach((doc) => {
                const docData = doc.data();
                if (docData !== undefined) {
                  this.addToItems(doc.id, docData as MpgItemData);
                }
              });
            } else {
              throw new Error(
                `MpgGraph: getCollectionSize: docRef is undefined`
              );
            }
          } else {
            throw new Error(
              `MpgGraph: getCollectionSize: authUser.uid is null`
            );
          }
        } else {
          throw new Error(`MpgGraph: getCollectionSize: authUser is null`);
        }
      } else {
        throw new Error(`MpgGraph: getCollectionSize: db is null`);
      }
    } catch (error) {
      throw error;
    }
  };

  private addToItems = async (id: string, itemData: MpgItemData) => {
    if (this.initialLoadInProgress) {
      this.itemsLoaded += 1;
      if (this.itemsLoaded % 10 === 0) {
        await this.invokeRefreshData();
      }
    }
    const item = MpgItem.fromItemData(id, itemData);
    this.items.set(item.id, item);
  };

  private updateUserDoc = async (user: MpgUser) => {
    try {
      // console.log("MpgGraphData: updateUserDoc: user:", user);
      if (this.db !== null) {
        if (this.authUser !== null) {
          if (this.authUser !== null) {
            if (this.authUser.uid !== null) {
              await this.db
                .collection("users")
                .doc(this.authUser.uid)
                .set(user.getData());
            } else {
              throw new Error("MpgGraphData: createUserData: user uid is null");
            }
          } else {
            throw new Error("MpgGraphData: createUserData: auth user is null");
          }
        } else {
          throw new Error("MpgGraphData: createUserData: db is null");
        }
      }
    } catch (error) {
      throw error;
    }
  };

  doesUserExist = async (): Promise<boolean> => {
    let userExists = false;
    try {
      if (this.db !== null) {
        if (this.authUser !== null) {
          if (this.authUser.uid !== null) {
            const userCollection = await this.db.collection("users").get();
            if (userCollection.size === 0) {
              return userExists;
            } else {
              userCollection.forEach((user) => {
                if (user.id === this.authUser?.uid) {
                  userExists = true;
                  return userExists;
                }
              });
            }
          } else {
            throw new Error(
              "MpgGraphData: doesUserExist: authUser uid is null"
            );
          }
        } else {
          throw new Error("doesUserExist: auth user is null");
        }
      } else {
        throw new Error("doesUserExist: db is null");
      }
    } catch (error) {
      throw error;
    } finally {
      return userExists;
    }
  };

  private loadUserDoc = async () => {
    try {
      if (this.db !== null) {
        if (this.authUser !== null) {
          if (this.authUser !== null) {
            if (this.authUser.uid !== null) {
              const docRef = await this.db
                .collection(this.userCollectionName)
                .doc(this.authUser.uid)
                .get();
              if (docRef !== undefined) {
                this.user = MpgUser.fromData(
                  docRef.id,
                  docRef.data() as MpgUserData
                );
              }
            } else {
              throw new Error("MpgGraphData: createUserData: user uid is null");
            }
          } else {
            throw new Error("MpgGraphData: createUserData: auth user is null");
          }
        } else {
          throw new Error("MpgGraphData: createUserData: db is null");
        }
      }
    } catch (error) {
      throw error;
    }
  };
}
