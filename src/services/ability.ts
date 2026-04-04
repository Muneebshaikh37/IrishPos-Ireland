import { Ability, AbilityBuilder } from '@casl/ability';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subjects = 'Post' | 'User' | 'Comment' | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;

export function defineAbilitiesFor(role: string) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability);

    if (role === 'admin') {
        can('manage', 'all'); // Admin can do anything
    } else if (role === 'editor') {
        can('read', 'Post');
        can('update', 'Post');
        cannot('delete', 'Post');
    } else {
        can('read', 'Post'); // Default role can only read posts
    }

    return build();
}
