/**
 * cause it's cool :)
 * @internal - This exists for testing purposes only.
 */
export class InMemoryQueryBuilder<T, K extends keyof T = never> {
    protected constructor(
        private readonly db: T[],
        private criteria: Partial<T> = {},
        private projection: K[] = [],
    ) {}

    // explicitly create with T = never since no projection is set yet
    public static create<T>(db: T[]): InMemoryQueryBuilder<T, never> {
        return new InMemoryQueryBuilder<T, never>(db);
    }

    /**
     * Adds new fields to the projection while keeping the return
     * types in sync with the projection.
     * @returns TestQueryBuilder of new type, with updated projection
     */
    protected static createProjectionExtension<
        T,
        KNew extends keyof T,
        KOld extends keyof T,
    >(
        builder: InMemoryQueryBuilder<T, KOld>,
        addedProjection: KNew[],
    ): InMemoryQueryBuilder<T, KOld | KNew> | InMemoryQueryBuilder<T, KNew> {
        if (addedProjection.length === 0) {
            throw new Error(
                `Projection extension requires changes in projection.`,
            );
        }

        const instance = new InMemoryQueryBuilder<T, KNew | KOld>(builder.db);
        instance.criteria = builder.criteria;
        instance.projection = [...builder.projection, ...addedProjection];
        return instance;
    }

    /**
     * Can be called multiple times to add more fields to projected result
     */
    public select<KSpecific extends keyof T>(
        ...fields: KSpecific[]
    ):
        | InMemoryQueryBuilder<T, K | KSpecific>
        | InMemoryQueryBuilder<T, KSpecific> {
        return InMemoryQueryBuilder.createProjectionExtension(this, fields);
    }

    /**
     * Can be called multiple times to add more criteria to filter results
     */
    public where(criteria: Partial<T>): InMemoryQueryBuilder<T, K> {
        this.criteria = { ...this.criteria, ...criteria };
        return this;
    }

    // !important: `[K] extends [never]` notation, not `K extends never`
    public first(): ([K] extends [never] ? T : Pick<T, K>) | undefined {
        const datum = this.db.find((datum) => this.isValidMatch(datum));
        return datum && this.project(datum);
    }

    // !important: `[K] extends [never]` notation, not `K extends never`
    public all(): [K] extends [never] ? T[] : Pick<T, K>[] {
        const entries = Object.entries(this.criteria);
        // prettier-ignore
        return (this.db
            .filter((datum) => this.isValidMatch(datum, entries))
            .map((datum) => this.project(datum))
        ) as [K] extends [never] ? T[] : Pick<T, K>[];
    }

    // !important: `[K] extends [never]` notation, not `K extends never`
    protected project(datum: T): [K] extends [never] ? T : Pick<T, K> {
        return (
            this.projection.length === 0
                ? datum
                : this.projection.reduce(
                      (acc, field) => {
                          acc[field] = datum[field];
                          return acc;
                      },
                      {} as Pick<T, K>,
                  )
        ) as [K] extends [never] ? T : Pick<T, K>;
    }

    protected isValidMatch(datum: T, entries?: [string, unknown][]): boolean {
        entries = entries ?? Object.entries(this.criteria);
        return entries.every(([key, value]) => datum[key as keyof T] === value);
    }
}
