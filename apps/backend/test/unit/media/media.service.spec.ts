import { Test, TestingModule } from "@nestjs/testing"
import { MediaService } from "../../../src/media/media.service"

describe("MediaService", () => {
    let service: MediaService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MediaService]
        }).compile()

        service = module.get<MediaService>(MediaService)
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })

    describe("processFiles", () => {
        it("should be defined", () => {
            expect(service.processFiles).toBeDefined()
        })
    })

    describe("deleteFile", () => {
        it("should be defined", () => {
            expect(service.deleteFile).toBeDefined()
        })
    })
})
