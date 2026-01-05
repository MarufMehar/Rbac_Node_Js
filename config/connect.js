import rbacConfig from './congif.json' with { type: 'json' };

export function sendPermission(role) {
  const permissions = rbacConfig.roles[role] || [];
  return permissions;
}


export function hasPermission(role, Permissions) {
    try{
  const permissions = rbacConfig.roles[role] || [];
  //return permissions.includes(permission);
  return Permissions.some(p => permissions.includes(p));
    }
catch(err){
    console.log(err);
    
}
}