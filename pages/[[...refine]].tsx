import { GetServerSideProps } from "next";
import {
  NextRouteComponent, 
  checkAuthentication,
  handleRefineParams,
} from "@pankod/refine-nextjs-router";
import { dataProvider } from "@pankod/refine-supabase";

import { authProvider } from "src/authProvider";
import { supabaseClient } from "src/utility";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { resource, action, id } = handleRefineParams(context.params?.refine);

  const i18nProps = await serverSideTranslations(context.locale ?? "en", [
    "common",
  ]);
  console.log(i18nProps)

  const { isAuthenticated, ...props } = await checkAuthentication(
    authProvider,
    context,
  );

  if (!isAuthenticated) {
    return props;
  }

    try {
        if (resource && action === "show" && id) {
            const data = await dataProvider(supabaseClient).getOne({
                resource: resource.slice(resource.lastIndexOf("/") + 1),
                id,
            });

            return {
                props: {
                    initialData: data,
                    ...i18nProps,
                },
            };
        } else if (resource && !action && !id) {
            const data = await dataProvider(supabaseClient).getList({
                resource: resource.slice(resource.lastIndexOf("/") + 1),
            });

            return {
                props: {
                    initialData: data,
                    ...i18nProps,
                },
            };
        }
    } catch (error) {
        return { props: {
          ...i18nProps,
        } };
    }

    return {
        props: {},
    };
};

export default NextRouteComponent.bind({ initialRoute: "/" });
/**
 * To define a custom initial route for refine to redirect and start with:
 *
 * Bind the `initialRoute` value to the `NextRouteComponent` like the following:
 *
 * export default NextRouteComponent.bind({ initialRoute: "/posts" });
 *
 **/
