import { gql, useQuery, useMutation } from "@apollo/client";
import {
  AcceptPendingInvitation,
  AcceptPendingInvitationVariables,
} from "graphql/AcceptPendingInvitation";
import {
  ClaimTeamInvitationCode,
  ClaimTeamInvitationCodeVariables,
} from "graphql/ClaimTeamInvitationCode";
import {
  DeleteUserFromWorkspace,
  DeleteUserFromWorkspaceVariables,
} from "graphql/DeleteUserFromWorkspace";
import { GetWorkspaceMembers, GetWorkspaceMembersVariables } from "graphql/GetWorkspaceMembers";
import {
  InviteNewWorkspaceMember,
  InviteNewWorkspaceMemberVariables,
} from "graphql/InviteNewWorkspaceMember";
import {
  RejectPendingInvitation,
  RejectPendingInvitationVariables,
} from "graphql/RejectPendingInvitation";
import { WorkspaceUser } from "ui/types";

export function useGetWorkspaceMembers(workspaceId: string) {
  const { data, loading, error } = useQuery<GetWorkspaceMembers, GetWorkspaceMembersVariables>(
    gql`
      query GetWorkspaceMembers($workspaceId: ID!) {
        node(id: $workspaceId) {
          ... on Workspace {
            id
            members {
              edges {
                node {
                  ... on WorkspacePendingEmailMember {
                    __typename
                    id
                    roles
                    email
                    createdAt
                  }
                  ... on WorkspacePendingUserMember {
                    __typename
                    id
                    roles
                    user {
                      id
                      name
                      picture
                    }
                  }
                  ... on WorkspaceUserMember {
                    __typename
                    id
                    roles
                    user {
                      id
                      name
                      picture
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      variables: { workspaceId },
    }
  );

  if (!workspaceId) {
    return { members: [], loading: false };
  }

  if (error) {
    console.error("Apollo error while fetching workspace members:", error);
  }

  let workspaceUsers: WorkspaceUser[] | undefined = undefined;
  // @ts-ignore
  const members = data?.node?.members;
  if (members) {
    workspaceUsers = members.edges.map(({ node }: any) => {
      if (node.__typename === "WorkspacePendingEmailMember") {
        return {
          membershipId: node.id,
          pending: true,
          email: node.email,
          createdAt: node.createdAt,
          roles: node.roles,
        };
      } else {
        return {
          membershipId: node.id,
          userId: node.user.id,
          pending: node.__typename === "WorkspacePendingUserMember",
          user: node.user,
          roles: node.roles,
        };
      }
    });
  }
  return { members: workspaceUsers, loading };
}

export function useInviteNewWorkspaceMember(onCompleted: () => void) {
  // Eventually we should handle error states better. For now, this is sufficient
  // to handle error cases where a user tries to add an already invited/existing
  // user to a team.
  const onError = onCompleted;

  const [inviteNewWorkspaceMember] = useMutation<
    InviteNewWorkspaceMember,
    InviteNewWorkspaceMemberVariables
  >(
    gql`
      mutation InviteNewWorkspaceMember($email: String!, $workspaceId: ID!, $roles: [String!]) {
        addWorkspaceMember(input: { email: $email, workspaceId: $workspaceId, roles: $roles }) {
          success
        }
      }
    `,
    { refetchQueries: ["GetWorkspaceMembers"], onCompleted, onError }
  );

  return inviteNewWorkspaceMember;
}

export function useClaimTeamInvitationCode(onCompleted: () => void, onError: () => void) {
  const [inviteNewWorkspaceMember] = useMutation<
    ClaimTeamInvitationCode,
    ClaimTeamInvitationCodeVariables
  >(
    gql`
      mutation ClaimTeamInvitationCode($code: ID!) {
        claimTeamInvitationCode(input: { code: $code }) {
          success
        }
      }
    `,
    { onCompleted, onError }
  );

  return inviteNewWorkspaceMember;
}

export function useDeleteUserFromWorkspace() {
  const [deleteUserFromWorkspace] = useMutation<
    DeleteUserFromWorkspace,
    DeleteUserFromWorkspaceVariables
  >(
    gql`
      mutation DeleteUserFromWorkspace($membershipId: ID!) {
        removeWorkspaceMember(input: { id: $membershipId }) {
          success
        }
      }
    `,
    { refetchQueries: ["GetWorkspaceMembers"] }
  );

  return deleteUserFromWorkspace;
}

export function useAcceptPendingInvitation(onCompleted: () => void) {
  const [acceptPendingInvitation] = useMutation<
    AcceptPendingInvitation,
    AcceptPendingInvitationVariables
  >(
    gql`
      mutation AcceptPendingInvitation($workspaceId: ID!) {
        acceptWorkspaceMembership(input: { id: $workspaceId }) {
          success
        }
      }
    `,
    {
      refetchQueries: ["GetNonPendingWorkspaces", "GetPendingWorkspaces"],
      onCompleted,
    }
  );

  return acceptPendingInvitation;
}

export function useRejectPendingInvitation(onCompleted: () => void) {
  const [rejectPendingInvitation] = useMutation<
    RejectPendingInvitation,
    RejectPendingInvitationVariables
  >(
    gql`
      mutation RejectPendingInvitation($workspaceId: ID!) {
        rejectWorkspaceMembership(input: { id: $workspaceId }) {
          success
        }
      }
    `,
    {
      refetchQueries: ["GetNonPendingWorkspaces", "GetPendingWorkspaces"],
      onCompleted,
    }
  );

  return rejectPendingInvitation;
}
