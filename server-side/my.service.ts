import { AddonAPIAsyncResult, PapiClient} from '@pepperi-addons/papi-sdk'
import { Client} from '@pepperi-addons/debug-server';
//import Semver from "semver";
import semverLessThanComparator from 'semver/functions/lt'

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

class MyService {

    papiClient: PapiClient;

    addOnsToInstall = [
        {name: 'Pfs', uuid: '00000000-0000-0000-0000-0000000f11e5', ver: '1.3.84', phased: false, release: true}, //done
        {name: 'System Health', uuid: 'f8b9fa6f-aa4d-4c8d-a78c-75aabc03c8b3', ver: '1.1.81', phased: true, release: true}, //done
        {name: 'Nebula', uuid: '00000000-0000-0000-0000-000000006a91', ver: '1.1.61', phased: false, release: true}, //wait for 1.1.61, bug fix
        {name: 'Sync', uuid: '5122dc6d-745b-4f46-bb8e-bd25225d350a', ver: '0.7.107', phased: true, release: true}, //done
        {name: 'Dimx', uuid: '44c97115-6d14-4626-91dc-83f176e9a0fc', ver: '1.0.13', phased: true, release: true}, //done
        {name: 'Cpi node', uuid: 'bb6ee826-1c6b-4a11-9758-40a46acb69c5', ver: '1.5.39', phased: true, release: true}, //done
        {name: 'Cpi node data', uuid: 'd6b06ad0-a2c1-4f15-bebb-83ecc4dca74b', ver: '0.6.17', phased: true, release: true}, //done
        {name: 'Papi', uuid: '00000000-0000-0000-0000-000000000a91', ver: '9.6.24', phased: true, release: true}, //done
        {name: 'cpapi', uuid: '00000000-0000-0000-0000-000000abcdef', ver: '9.6.31', phased: true, release: true}, //done
        {name: 'Core', uuid: '00000000-0000-0000-0000-00000000c07e', ver: '1.1.2', phased: true, release: true}, //done
        {name: 'Core resources', uuid: 'fc5a5974-3b30-4430-8feb-7d5b9699bc9f', ver: '1.1.60', phased: true, release: true}, //done
        {name: 'Configuration', uuid: '84c999c3-84b7-454e-9a86-71b7abc96554', ver: '0.6.105', phased: true, release: true}, //wait for 0.7, import/export
        {name: 'Flows', uuid: 'dc8c5ca7-3fcc-4285-b790-349c7f3908bd', ver: '0.6.20', phased: true, release: true}, //done
        {name: 'Cpas', uuid: '00000000-0000-0000-0000-0000003eba91', ver: '17.30.6', phased: true, release: true}, //done
       // {name: 'Local storage', uuid: '5130126c-1c2a-446f-9d08-754269fdaa72', ver: '1.0.1', phased: false, release: false},
        /************UI BLOCKS**************/
        {name: 'Slugs', uuid: '4ba5d6f9-6642-4817-af67-c79b68c96977', ver: '1.2.25', phased: true, release: true}, //done
        {name: 'Assets Manager', uuid: 'ad909780-0c23-401e-8e8e-f514cc4f6aa2', ver: '1.2.15', phased: true, release: true}, //done
        {name: 'Pages', uuid: '50062e0c-9967-4ed4-9102-f2bc50602d41', ver: '2.0.123', phased: false, release: true}, //done
        {name: 'Gallery2', uuid: '194772e8-1c45-48ee-9401-bea82f0d7c65', ver: '2.0.20', phased: false, release: true}, //done
        {name: 'Slideshow2', uuid: '16d2052b-55b7-43b5-9d3b-a2f9d9950d59', ver: '2.0.41', phased: false, release: true}, //done
        {name: 'Themes', uuid: '95501678-6687-4fb3-92ab-1155f47f839e', ver: '2.1.8', phased: false, release: true}, //done
        {name: 'Application Header', uuid: '9bc8af38-dd67-4d33-beb0-7d6b39a6e98d', ver: '0.5.45', phased: false, release: true}, //done
        {name: 'Banner', uuid: '58054aa9-5667-4fbf-9b9a-f9c94cd00906', ver: '0.9.27', phased: false, release: true}, //done
        {name: 'Buttons', uuid: '0eb2627d-2bc2-4d73-9ac6-d5b191cb59a2', ver: '0.0.56', phased: false, release: true}, //done
        {name: 'basic-logic-blocks', uuid: 'a446f8ae-3787-497b-9a92-82e571bdf48e', ver: '1.0.16', phased: false, release: true}, //done
        {name: 'filter block', uuid: 'd00398a6-3b65-47a0-b02c-08f5de960740', ver: '0.5.36', phased: true, release: true}, //done
        {name: 'rich text', uuid: '3864cd44-b388-41c5-8af9-ec200f72b3f3', ver: '1.0.29', phased: false, release: true}, //done
        {name: 'WebApp', uuid: '00000000-0000-0000-1234-000000000b2b', ver: '18.0.20', phased: false, release: true} //done
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
            for (let i=0;i<this.addOnsToInstall.length;i++) {
                const addOnToUpdate = installedAddons.find(o => o.Addon?.UUID === this.addOnsToInstall[i].uuid);
                if (addOnToUpdate) {
                    if (semverLessThanComparator(addOnToUpdate.Version, this.addOnsToInstall[i].ver)){ //upgrade
                        const res = await this.papiClient.addons.installedAddons.addonUUID(this.addOnsToInstall[i].uuid).upgrade(this.addOnsToInstall[i].ver);
                        await this.installAddonRecursive(res, this.addOnsToInstall[i].name);
                        }
                } else
                { //install
                    const res = await this.papiClient.addons.installedAddons.addonUUID(this.addOnsToInstall[i].uuid).install(this.addOnsToInstall[i].ver);
                    await this.installAddonRecursive(res, this.addOnsToInstall[i].name);
                }
                try { ///upgrade to the phased version if needed
                    if (this.addOnsToInstall[i].phased) { //if phased = true we will upgrade to the latest phased
                        const res = await this.papiClient.addons.installedAddons.addonUUID(this.addOnsToInstall[i].uuid).upgrade();
                        await this.installAddonRecursive(res, this.addOnsToInstall[i].name);
                    }
                }
                catch (err){ console.log(err); }
            }
        }
        catch (e)
        {
            console.log(e);
            throw e;
        }
    }
    getInstalledAddons(): Promise<any[]> {
        return this.papiClient.addons.installedAddons.iter({}).toArray();
    }
    async installAddonRecursive(result: AddonAPIAsyncResult, addonName: string){
        let statusResponse = await this.papiClient.get(`/audit_logs/${result.ExecutionUUID}`);

        while (!statusResponse || statusResponse.Status.Name === 'New' || statusResponse.Status.Name === 'InProgress' || statusResponse.Status.Name === 'Started') {
            await sleep(1000);
            statusResponse = await this.papiClient.get(`/audit_logs/${result.ExecutionUUID}`);
        }
        if (statusResponse.Status.Name === 'Success') {
            console.log(`addon ${addonName} installed upgraded successfuly.`);
        }
        else {
            console.log(`failed to install upgrade ${addonName} addon.`);
            throw new Error(statusResponse.AuditInfo.ErrorMessage);
        }
    }
}

export default MyService;
