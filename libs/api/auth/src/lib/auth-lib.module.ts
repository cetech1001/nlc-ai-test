import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {DatabaseModule} from "@nlc-ai/api-database";
import {JwtStrategy} from "./strategies";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    DatabaseModule.forFeature(),
  ],
  providers: [
    JwtStrategy,
  ]
})
export class AuthLibModule {}
