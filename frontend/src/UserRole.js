export class UserRole {

    constructor(authEndpoint='/api/auth', fallbackRole='admin') {
        var role=localStorage.getItem("role");
        if(role=="editor"){
            this.currentROle="admin"
        }
        else{
            this.currentROle="viewer"
        }
        this.endpoint = authEndpoint;
        console.log("user===========role=======")
    }

    getUserInfo() {
        return fetch(this.endpoint, {mode: 'cors', credentials: 'include' })
            .then((resp) => {
                if (resp.ok ) {
                    alert('this is in get users');
                    return resp.json();
                } else {
                    return { username: 'unknown' };
                }
            })
            .then((creds) => {
                this.username = creds.username;
                this.defaultGroup = creds.defaultGroup || this.currentROle;
                this.permittedGroups = creds.permittedGroups || [this.currentROle];

                return this;
            })
            .catch((err) => {
                console.error('err in auth or app setup: ', err);
                this.username = 'unknown';
                this.defaultGroup = this.currentROle;
                this.permittedGroups = [this.currentROle];

                return this;
            })
            .then(() => {
                this._modifyAuthAttrs();
                return this;
            });
    }

    _modifyAuthAttrs() {
        if (this.username && this.username.split('-').length === 2) {
            let [user, group] = this.username.split('-');
            this.username = user;
            this.defaultGroup = group;
            this.permittedGroups = [group];
        }

        if (this.defaultGroup === 'admin') {
            this.permittedGroups = ['admin', 'viewer'];
        }

    }
    getRole() {
        return this.defaultGroup;
    }
    getAvailableRoles() {
        return this.permittedGroups;
    }
    getUser() {
        return this.username;
    }
};

