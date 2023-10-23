import { PapiClient, InstalledAddon} from '@pepperi-addons/papi-sdk'
import { Client} from '@pepperi-addons/debug-server';
//import jwt_decode from "jwt-decode";
//import { GenericListMenusDataViews } from './metadata';
import Semver from "semver";

class MyService {

    papiClient: PapiClient;

    addOnsToInstall = [
        {name: 'Pfs', uuid: '00000000-0000-0000-0000-0000000f11e5', ver: '1.3.8', phased: true, release: true},
        {name: 'Nebula', uuid: '00000000-0000-0000-0000-000000006a91', ver: '1.0.112', phased: true, release: true},
        {name: 'Sync', uuid: '5122dc6d-745b-4f46-bb8e-bd25225d350a', ver: '0.7.84', phased: false, release: false},
        {name: 'Dimx', uuid: '44c97115-6d14-4626-91dc-83f176e9a0fc', ver: '1.0.13', phased: true, release: true},
        {name: 'Cpi node', uuid: 'bb6ee826-1c6b-4a11-9758-40a46acb69c5', ver: '1.5.4', phased: true, release: true},
        {name: 'Cpi node data', uuid: 'd6b06ad0-a2c1-4f15-bebb-83ecc4dca74b', ver: '0.6.17', phased: true, release: true},
        {name: 'Configuration', uuid: '84c999c3-84b7-454e-9a86-71b7abc96554', ver: '0.6.102', phased: false, release: false},
        {name: 'Flows', uuid: 'dc8c5ca7-3fcc-4285-b790-349c7f3908bd', ver: '0.6.17', phased: false, release: false},
        {name: 'Cpas', uuid: '00000000-0000-0000-0000-0000003eba91', ver: '17.20.9', phased: true, release: true},
        {name: 'Local storage', uuid: '5130126c-1c2a-446f-9d08-754269fdaa72', ver: '1.0.1', phased: false, release: false},
        {name: 'Slugs', uuid: '4ba5d6f9-6642-4817-af67-c79b68c96977', ver: '1.2.23', phased: true, release: true},
        {name: 'Assets Manager ', uuid: 'ad909780-0c23-401e-8e8e-f514cc4f6aa2', ver: '1.2.2', phased: true, release: false},
        {name: 'Pages', uuid: '50062e0c-9967-4ed4-9102-f2bc50602d41', ver: '2.0.28', phased: false, release: false},
        {name: 'Gallery2', uuid: '194772e8-1c45-48ee-9401-bea82f0d7c65', ver: '2.0.5', phased: false, release: false},
        {name: 'Slideshow2', uuid: '16d2052b-55b7-43b5-9d3b-a2f9d9950d59', ver: '2.0.10', phased: false, release: false},
        {name: 'Themes', uuid: '95501678-6687-4fb3-92ab-1155f47f839e', ver: '2.1.4', phased: false, release: true},
        {name: 'Application Header', uuid: '9bc8af38-dd67-4d33-beb0-7d6b39a6e98d', ver: '0.5.33', phased: false, release: false},
        {name: 'Banner', uuid: '58054aa9-5667-4fbf-9b9a-f9c94cd00906', ver: '0.9.14', phased: false, release: false},
        {name: 'Buttons', uuid: '0eb2627d-2bc2-4d73-9ac6-d5b191cb59a2', ver: '0.0.46', phased: false, release: false},
        {name: 'basic-logic-blocks', uuid: 'a446f8ae-3787-497b-9a92-82e571bdf48e', ver: '1.0.5', phased: false, release: true},
        {name: 'WebApp', uuid: '00000000-0000-0000-1234-000000000b2b', ver: '18.0.13', phased: true, release: true}
    ]

    constructor(private client: Client) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonUUID: client.AddonUUID,
            addonSecretKey: client.AddonSecretKey
        });
    }
    async installAppHeader(){
        const installedAddons = await this.getInstalledAddons();

        try {

            this.addOnsToInstall.forEach(async addOn => {
                const addOnToUpdate = installedAddons.find(o => o.Addon?.UUID === addOn.uuid);
            if (addOnToUpdate) {
                if (Semver.lt(addOnToUpdate.Version, addOn.ver)){
                    //upgrade
                    const res = await this.papiClient.addons.installedAddons.addonUUID(addOn.uuid).upgrade(addOn.ver);
                    console.log(`${addOnToUpdate.Addon?.Name} Upgraded.`);
                    }
                } else
                { //install
                    await this.papiClient.addons.installedAddons.addonUUID(addOn.uuid).install(addOn.ver);
                    console.log(`${addOn.name} Installed.`);
                }

                ///upgrade to the phased version if needed
                try {
                    if (addOn.phased) { //if phased = true we will upgrade to the latest phased
                        const res = await this.papiClient.addons.installedAddons.addonUUID(addOn.uuid).upgrade();
                    }
                }
                catch (err){
                    console.log(err);
                }
            });
        }
        catch (e)
        {
            throw e;
        }

    }
    getInstalledAddons(): Promise<any[]> {
        return this.papiClient.addons.installedAddons.iter({}).toArray();
    }
}

export default MyService;
