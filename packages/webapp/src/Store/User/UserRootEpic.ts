import type {TAppEpic} from "../App/Epics/TAppEpic";
import {concat, EMPTY, from, of, switchMap, take} from "rxjs";
import {userSlice} from "./UserSlice";
import {combineEpics, ofType} from "redux-observable";
import {WEBAPP_ROUTES} from "@way-to-bot/shared/src/constants/webappRoutes";
import {getNotNil} from "../../Utils/GetNotNil";
import {routerEpic} from "../Utils/RouterEpic";
import {isDev} from "../../Utils/OneLineUtils";
import {PathMatch} from "react-router-dom";

const userInitLoadEpic: TAppEpic = (_, state$, {httpApi}) =>
    state$.pipe(
        take(1),
        switchMap(() => {
            const username = isDev
                ? (Telegram.WebApp.initDataUnsafe.user?.username ?? "user_1")
                : Telegram.WebApp.initDataUnsafe.user?.username;

            if (!username) {
                return EMPTY;
            }

            return concat(
                of(userSlice.actions.started()),
                from(httpApi.getOrCreateUserByUsername(username)).pipe(
                    switchMap((data) => of(userSlice.actions.received(data))),
                ),
            );
        }),
    );

const userLoadProfilePageByIdEpic =
    (match: PathMatch): TAppEpic =>
        (_, __, {httpApi}) => {
            const id = getNotNil(match.params.id, "userRouterEpic");

            return concat(
                of(userSlice.actions.profilePageStarted()),
                from(httpApi.getUserById(Number(id))).pipe(
                    switchMap((data) => of(userSlice.actions.profilePageReceived(data))),
                ),
            );
        };

const userRouterEpic = routerEpic(WEBAPP_ROUTES.profileRoute, (match) =>
    combineEpics(userLoadProfilePageByIdEpic(match)),
);

const userUpdateProfileEpic: TAppEpic = (action$, __, {httpApi}) =>
    action$.pipe(
        ofType(userSlice.actions.update.type),
        switchMap((payload) =>
            from(httpApi.updateUser(payload)).pipe(
                switchMap((value) => of(userSlice.actions.updateResult(value))),
            ),
        ),
    );

const updateProfileRouterEpic = routerEpic(
    WEBAPP_ROUTES.updateProfileRoute,
    (match) =>
        combineEpics(userLoadProfilePageByIdEpic(match), userUpdateProfileEpic),
);

const userRootEpic = combineEpics(
    userInitLoadEpic,
    userRouterEpic,
    updateProfileRouterEpic,
);

export {userRootEpic};
