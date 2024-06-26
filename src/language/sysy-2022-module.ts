import { type Module, inject } from 'langium';
import { createDefaultModule, createDefaultSharedModule, type DefaultSharedModuleContext, type LangiumServices, type LangiumSharedServices, type PartialLangiumServices } from 'langium/lsp';
import { Sysy2022GeneratedModule, Sysy2022GeneratedSharedModule } from './generated/module.js';
import { Sysy2022Validator, registerValidationChecks } from './sysy-2022-validator.js';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type Sysy2022AddedServices = {
    validation: {
        Sysy2022Validator: Sysy2022Validator
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type Sysy2022Services = LangiumServices & Sysy2022AddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const Sysy2022Module: Module<Sysy2022Services, PartialLangiumServices & Sysy2022AddedServices> = {
    validation: {
        Sysy2022Validator: () => new Sysy2022Validator()
    }
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createSysy2022Services(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    Sysy2022: Sysy2022Services
} {
    const shared = inject(
        createDefaultSharedModule(context),
        Sysy2022GeneratedSharedModule
    );
    const Sysy2022 = inject(
        createDefaultModule({ shared }),
        Sysy2022GeneratedModule,
        Sysy2022Module
    );
    shared.ServiceRegistry.register(Sysy2022);
    registerValidationChecks(Sysy2022);
    return { shared, Sysy2022 };
}
